import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Middleware provides a fast edge check. This server-side check is the
// authority, so a role changed after JWT issuance cannot render dashboard
// data while the browser still has the old token.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login?callbackUrl=/dashboard");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    redirect("/profile");
  }

  return children;
}
