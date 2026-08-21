import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Only an authenticated AGENT or ADMIN may pass into /dashboard — a
// signed-in plain USER account is a valid session too, but must never be
// treated as dashboard access.
export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => token?.role === "AGENT" || token?.role === "ADMIN",
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
