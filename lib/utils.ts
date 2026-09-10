import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, listingType?: "SALE" | "RENT") {
  const formatted = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
  return listingType === "RENT" ? `${formatted}/yr` : formatted;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

type PropertyLocation = {
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
};

const normalizeLocationPart = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Formats a listing address without repeating an area, city, or state that
 * was already typed into its address field. This is common in imported
 * listings, e.g. "Agric Estate, Ilorin Kwara State" + matching fields.
 */
export function formatPropertyLocation({ address, neighborhood, city, state }: PropertyLocation) {
  const locationParts = [neighborhood, city, state].filter((value): value is string => Boolean(value?.trim()));
  const termsToStrip = [...locationParts].flatMap((part) => {
    const trimmed = part.trim();
    return /\bstate$/i.test(trimmed) ? [trimmed] : [trimmed, `${trimmed} State`];
  }).sort((a, b) => b.length - a.length);

  let streetAddress = address?.trim() || "";
  for (const term of termsToStrip) {
    streetAddress = streetAddress.replace(new RegExp(`\\b${escapeRegExp(term)}\\b`, "gi"), " ");
  }
  streetAddress = streetAddress.replace(/\s*,\s*/g, ", ").replace(/(?:,\s*){2,}/g, ", ").replace(/^,\s*|,\s*$/g, "").replace(/\s{2,}/g, " ").trim();

  const parts = [streetAddress, ...locationParts].filter(Boolean);
  const uniqueParts = parts.filter((part, index) =>
    parts.findIndex((candidate) => normalizeLocationPart(candidate) === normalizeLocationPart(part)) === index
  );

  return uniqueParts.join(", ");
}

const NEW_LISTING_WINDOW_MS = 14 * 24 * 60 * 60 * 1000;

/** A quiet, date-derived label for listings added in the last two weeks. */
export function formatNewListingLabel(createdAt: string | Date, now = new Date()) {
  const created = new Date(createdAt);
  const elapsed = now.getTime() - created.getTime();

  if (Number.isNaN(created.getTime()) || elapsed >= NEW_LISTING_WINDOW_MS) return null;
  if (elapsed < 60 * 60 * 1000) return "New · Just now";

  const hours = Math.floor(elapsed / (60 * 60 * 1000));
  if (hours < 24) return `New · ${hours} ${hours === 1 ? "hr" : "hrs"} ago`;

  const days = Math.floor(elapsed / (24 * 60 * 60 * 1000));
  if (days < 7) return `New · ${days} ${days === 1 ? "day" : "days"} ago`;

  const weeks = Math.floor(days / 7);
  return `New · ${weeks} ${weeks === 1 ? "week" : "weeks"} ago`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Generates a spec-sheet style reference like RA-014
export function toReference(sequence: number) {
  return `RA-${String(sequence).padStart(3, "0")}`;
}

// MongoDB ObjectIds are always exactly 24 hex characters. Property slugs
// never match this shape, so this safely tells them apart before building
// a Prisma query — querying an `@db.ObjectId` field with a non-ObjectId
// string (like a slug) throws at the database level rather than just not
// matching, so callers must skip the `id` clause entirely for slugs.
export function isValidObjectId(value: string) {
  return /^[a-f\d]{24}$/i.test(value);
}
