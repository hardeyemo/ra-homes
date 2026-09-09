/** Removes characters that do not belong in a person's name or place name. */
export function textOnly(value: string) {
  return value.replace(/[^A-Za-z\s.'-]/g, "");
}

/** Server-side counterpart for fields that must not contain digits or symbols. */
export const textOnlyPattern = /^[A-Za-z\s.'-]+$/;

/** Keeps values intended to be numeric free from letters and symbols. */
export function numericOnly(value: string, allowDecimal = false) {
  const cleaned = value.replace(allowDecimal ? /[^\d.]/g : /\D/g, "");
  if (!allowDecimal) return cleaned;
  const [whole = "", ...decimals] = cleaned.split(".");
  return decimals.length ? `${whole}.${decimals.join("")}` : whole;
}
