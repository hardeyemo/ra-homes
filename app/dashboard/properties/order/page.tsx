import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PropertyOrderEditor } from "@/components/dashboard/PropertyOrderEditor";

export default async function PropertyOrderPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (user?.role !== "ADMIN") redirect("/dashboard");
  const properties = await prisma.property.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }, { id: "asc" }],
    select: { id: true, reference: true, title: true, status: true },
  });
  return <div className="bg-parchment py-8 md:py-12"><div className="container max-w-4xl"><PropertyOrderEditor initialProperties={properties} /></div></div>;
}
