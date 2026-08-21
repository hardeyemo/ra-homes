import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";
import type { AgentRequestStatus, Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "USER" | "AGENT" | "ADMIN";
      agentRequestStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role?: Role;
    agentRequestStatus?: AgentRequestStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    userId?: string;
    role?: Role;
    agentRequestStatus?: AgentRequestStatus;
  }
}
