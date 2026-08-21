import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import ImportPageClient from "./ImportPageClient";

export default async function ImportPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const agent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!agent || agent.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="container py-12">
      <DashboardNav isAdmin />
      <ImportPageClient />
    </div>
  );
}
