import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can approve or reject submissions" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const submission = await prisma.propertySubmission.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    return NextResponse.json({ submission });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
