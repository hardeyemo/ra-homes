import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

// Middleware provides a fast edge check. This server-side check is the
// authority, so a role changed after JWT issuance cannot render dashboard
// data while the browser still has the old token.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, name: true, email: true },
  });

  if (!user || (user.role !== "AGENT" && user.role !== "ADMIN")) {
    redirect("/profile");
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-parchment lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <DashboardNav isAdmin={isAdmin} name={user.name || "RAHomes Realty"} email={user.email} />
      <main className="min-w-0 py-2 sm:py-3 lg:py-5">{children}</main>
    </div>
  );
}
