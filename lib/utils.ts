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
