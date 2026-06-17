/**
 * Text sanitization for block attribute values.
 *
 * Every string that comes from the editor passes through here before it is
 * stored or rendered. We strip anything that could become an execution sink
 * even though the renderer never uses dangerouslySetInnerHTML — defense in
 * depth, in case a future block does.
 */

const MAX_TEXT_LENGTH = 600;

const DANGEROUS_PATTERNS: RegExp[] = [
  /<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,
  /<\/?[a-z][\s\S]*?>/gi, // any HTML tag
  /on\w+\s*=/gi, // inline event handlers
  /javascript:/gi,
  /data:text\/html/gi,
  /<!--[\s\S]*?-->/g,
];

/** Strip markup/handlers and clamp length. Returns a plain-text safe string. */
export function sanitizeText(input: unknown): string {
  let value = typeof input === "string" ? input : String(input ?? "");
  for (const pattern of DANGEROUS_PATTERNS) {
    value = value.replace(pattern, "");
  }
  // collapse whitespace, trim, clamp
  value = value.replace(/\s+/g, " ").trim();
  if (value.length > MAX_TEXT_LENGTH) value = value.slice(0, MAX_TEXT_LENGTH);
  return value;
}

/**
 * Sanitize a URL for image/link fields. Only absolute http(s) URLs survive;
 * everything else (javascript:, data:, relative junk) collapses to "" so it
 * can never become an execution sink. Length-clamped.
 */
export function sanitizeUrl(input: unknown): string {
  const raw = typeof input === "string" ? input.trim() : "";
  if (!/^https?:\/\//i.test(raw)) return "";
  // reject control chars / spaces / quotes that could break out of an attribute
  if (/[\s"'<>\\]/.test(raw)) return "";
  return raw.length > 500 ? "" : raw;
}

/** Sanitize a comma-separated list (e.g. navbar links). */
export function sanitizeList(input: unknown, maxItems = 8): string[] {
  const raw = typeof input === "string" ? input : Array.isArray(input) ? input.join(",") : "";
  return raw
    .split(",")
    .map((part) => sanitizeText(part))
    .filter(Boolean)
    .slice(0, maxItems);
}
