import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

interface LogActivityInput {
  agentId: string;
  agentName: string;
  action: "created" | "updated" | "status_changed" | "price_changed" | "deleted";
  propertyId?: string;
  propertyRef?: string;
  propertyTitle?: string;
  summary: string;
}

export async function logActivity(input: LogActivityInput) {
  try {
    await prisma.activityLog.create({ data: input });
  } catch (err) {
    // Never let logging failures break the actual property operation.
    console.error("Failed to write activity log:", err);
  }
}

// Compares old vs new property data and returns a plain-English summary of
// what changed, focused on the fields admins care most about (price, status).
export function summarizeChanges(
  before: { price: number; status: string; title: string; featured: boolean },
  after: { price?: number; status?: string; featured?: boolean }
): { summary: string; action: "updated" | "status_changed" | "price_changed" } | null {
  const parts: string[] = [];
  let action: "updated" | "status_changed" | "price_changed" = "updated";

  if (after.price !== undefined && after.price !== before.price) {
    parts.push(`price changed from ${formatPrice(before.price)} to ${formatPrice(after.price)}`);
    action = "price_changed";
  }
  if (after.status !== undefined && after.status !== before.status) {
    parts.push(`status changed from ${before.status} to ${after.status}`);
    if (action !== "price_changed") action = "status_changed";
  }
  if (after.featured !== undefined && after.featured !== before.featured) {
    parts.push(after.featured ? "marked as featured" : "removed from featured");
  }

  if (parts.length === 0) return null;
  return { summary: `${before.title}: ${parts.join("; ")}`, action };
}
