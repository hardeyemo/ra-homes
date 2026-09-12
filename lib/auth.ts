import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// One account type for the whole site — agents, admins, and regular
// visitors all sign in through the same route. Google/Facebook are only
// registered if their env vars are actually set, so a missing setup step
// doesn't break the whole auth system.
const oauthProviders = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
  oauthProviders.push(
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    })
  );
}

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });
        // No passwordHash means this account was created via Google/Facebook —
        // there's nothing to compare against, so credentials login can't work for it.
        if (!user || !user.passwordHash || (user.requiresEmailVerification && !user.emailVerified)) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          agentRequestStatus: user.agentRequestStatus,
        };
      },
    }),

    ...oauthProviders,
  ],
  callbacks: {
    // Only runs for OAuth sign-ins (google/facebook) — the credentials
    // provider already validated everything in its own authorize().
    // Finds or creates the matching User record so a Google/Facebook
    // sign-in becomes a real account in our database.
    async signIn({ user, account }) {
      if (!account || account.provider === "credentials") {
        return true;
      }
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      const dbUser =
        existing ||
        (await prisma.user.create({
          data: {
            name: user.name || user.email.split("@")[0],
            email: user.email,
            image: user.image || undefined,
            provider: account.provider,
          },
        }));

      user.id = dbUser.id;
      (user as any).role = dbUser.role;
      (user as any).agentRequestStatus = dbUser.agentRequestStatus;
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const u = user as any;
        token.userId = u.id;
        token.role = u.role;
        token.agentRequestStatus = u.agentRequestStatus;
      }
      // Authorize against the current database role, not only the role
      // present when the JWT was issued. Approvals and revocations then take
      // effect on the next authenticated request.
      if (token.userId) {
        const fresh = await prisma.user.findUnique({ where: { id: token.userId as string } });
        if (fresh) {
          token.role = fresh.role;
          token.agentRequestStatus = fresh.agentRequestStatus;
        } else {
          token.role = "USER";
          token.agentRequestStatus = "NONE";
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.role = token.role || "USER";
        session.user.agentRequestStatus = token.agentRequestStatus || "NONE";
      }
      return session;
    },
  },
};
