import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PropertyForm } from "@/components/dashboard/PropertyForm";

export default async function EditPropertyPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const currentAgent = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!currentAgent) redirect("/login");

  const property = await prisma.property.findUnique({ where: { id: params.id } });
  if (!property) notFound();

  // Agents may only edit their own listings; admins may edit any.
  if (session.user.role !== "ADMIN" && property.agentId !== session.user.id) {
    notFound();
  }

  const data = JSON.parse(JSON.stringify(property));

  return (
    <div className="container py-12 max-w-3xl">
      <DashboardNav isAdmin={currentAgent.role === "ADMIN"} />
      <p className="font-mono text-xs uppercase tracking-widest text-clay">Dashboard</p>
      <h1 className="mt-2 font-display text-4xl">Edit {data.reference}</h1>
      <div className="mt-10">
        <PropertyForm agentId={data.agentId} initialData={data} propertyId={data.id} />
      </div>
    </div>
  );
}
