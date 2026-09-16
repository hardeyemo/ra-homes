import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidObjectId } from "@/lib/utils";

const updateSubmissionSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only the RA team can approve or reject submissions" }, { status: 403 });
  }

  try {
    const body = updateSubmissionSchema.parse(await req.json());
    const submission = await prisma.propertySubmission.update({
      where: { id: params.id },
      data: { status: body.status },
    });
    return NextResponse.json({ submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid submission status" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
