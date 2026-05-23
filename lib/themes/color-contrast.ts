const HEX_COLOR_REGEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const raw = value.trim();
  if (!HEX_COLOR_REGEX.test(raw)) return null;

  if (raw.length === 4) {
    const [, r, g, b] = raw;
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return raw.toLowerCase();
}

function hexToRgb(value: string): [number, number, number] | null {
  const hex = normalizeHexColor(value);
  if (!hex) return null;
  const number = parseInt(hex.slice(1), 16);
  return [
    (number >> 16) & 255,
    (number >> 8) & 255,
    number & 255,
  ];
}

function linearize(channel: number): number {
  const normalized = channel / 255;
  if (normalized <= 0.03928) return normalized / 12.92;
  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(color: string): number | null {
  const rgb = hexToRgb(color);
  if (!rgb) return null;
  const [r, g, b] = rgb;
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b);
}

export function contrastRatio(a: string, b: string): number | null {
  const la = luminance(a);
  const lb = luminance(b);
  if (la == null || lb == null) return null;

  const [lighter, darker] = la > lb ? [la, lb] : [lb, la];
  return (lighter + 0.05) / (darker + 0.05);
}

export function pickReadableForeground(
  background: string,
  options?: { dark?: string; light?: string },
): string {
  const dark = options?.dark ?? "#111827";
  const light = options?.light ?? "#ffffff";
  const darkContrast = contrastRatio(background, dark);
  const lightContrast = contrastRatio(background, light);

  if (darkContrast == null && lightContrast == null) return light;
  if (darkContrast == null) return light;
  if (lightContrast == null) return dark;

  return darkContrast >= lightContrast ? dark : light;
}

export function pickReadableTextColor(
  candidates: Array<string | null | undefined>,
  surfaces: Array<string | null | undefined>,
  fallback: string,
): string {
  const normalizedSurfaces = surfaces
    .map((surface) => normalizeHexColor(surface))
    .filter((surface): surface is string => Boolean(surface));
  if (normalizedSurfaces.length === 0) return fallback;

  const normalizedCandidates = candidates
    .map((candidate) => normalizeHexColor(candidate))
    .filter((candidate): candidate is string => Boolean(candidate));
  if (normalizedCandidates.length === 0) return fallback;

  let bestColor: string | null = null;
  let bestScore = -1;

  for (const candidate of normalizedCandidates) {
    const scores = normalizedSurfaces
      .map((surface) => contrastRatio(candidate, surface))
      .filter((score): score is number => score != null);
    if (scores.length === 0) continue;

    const score = Math.min(...scores);
    if (score > bestScore) {
      bestScore = score;
      bestColor = candidate;
    }
  }

  if (!bestColor || bestScore < 4.5) return fallback;
  return bestColor;
}
