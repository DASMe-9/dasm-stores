export type StoreHeroMotion = "aurora" | "spotlight" | "mesh" | "silk" | "neon";

export type StoreTheme = {
  slug: string;
  name: string;
  tier: "free" | "paid";
  description: string;
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  card: string;
  border: string;
  heroMotion: StoreHeroMotion;
};

export type StoreThemeConfig = {
  theme_slug?: string;
  themeSlug?: string;
  palette?: string;
  primary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  muted_foreground?: string;
  mutedForeground?: string;
  card?: string;
  border?: string;
  hero_motion?: StoreHeroMotion;
  heroMotion?: StoreHeroMotion;
  hero_video_url?: string | null;
  heroVideoUrl?: string | null;
};

export const FREE_STORE_THEMES: StoreTheme[] = [
  {
    slug: "dasm-emerald",
    name: "DASM Emerald",
    tier: "free",
    description: "Clean DASM default for broad retail stores.",
    primary: "#0f766e",
    accent: "#0284c7",
    background: "#fafafa",
    foreground: "#171717",
    muted: "#f4f4f5",
    mutedForeground: "#71717a",
    card: "#ffffff",
    border: "#e4e4e7",
    heroMotion: "aurora",
  },
  {
    slug: "royal-blue",
    name: "Royal Blue",
    tier: "free",
    description: "Trust-focused blue for electronics and professional sellers.",
    primary: "#1e40af",
    accent: "#3b82f6",
    background: "#f8fafc",
    foreground: "#0f172a",
    muted: "#e2e8f0",
    mutedForeground: "#64748b",
    card: "#ffffff",
    border: "#dbeafe",
    heroMotion: "spotlight",
  },
  {
    slug: "rose-market",
    name: "Rose Market",
    tier: "free",
    description: "Warm retail styling for beauty, fashion, and gifts.",
    primary: "#be123c",
    accent: "#fb7185",
    background: "#fff7f8",
    foreground: "#18181b",
    muted: "#ffe4e6",
    mutedForeground: "#9f1239",
    card: "#ffffff",
    border: "#fecdd3",
    heroMotion: "silk",
  },
  {
    slug: "luxury-gold",
    name: "Luxury Gold",
    tier: "free",
    description: "Premium look for showrooms and high-ticket products.",
    primary: "#92400e",
    accent: "#f59e0b",
    background: "#fffbeb",
    foreground: "#1c1917",
    muted: "#fef3c7",
    mutedForeground: "#92400e",
    card: "#ffffff",
    border: "#fde68a",
    heroMotion: "mesh",
  },
  {
    slug: "night-neon",
    name: "Night Neon",
    tier: "free",
    description: "Dark cinematic theme for tech and performance stores.",
    primary: "#14b8a6",
    accent: "#8b5cf6",
    background: "#050505",
    foreground: "#f8fafc",
    muted: "#18181b",
    mutedForeground: "#a1a1aa",
    card: "#111113",
    border: "#27272a",
    heroMotion: "neon",
  },
];

export const STORE_THEMES = FREE_STORE_THEMES;

const THEME_ALIASES: Record<string, string> = {
  emerald: "dasm-emerald",
  indigo: "royal-blue",
  royal: "royal-blue",
  rose: "rose-market",
  amber: "luxury-gold",
  slate: "night-neon",
};

export function getStoreTheme(slug?: string | null): StoreTheme {
  const resolvedSlug = slug ? (THEME_ALIASES[slug] ?? slug) : STORE_THEMES[0].slug;
  return STORE_THEMES.find((theme) => theme.slug === resolvedSlug) ?? STORE_THEMES[0];
}

export function getThemeSlug(config?: StoreThemeConfig | null): string {
  const slug = config?.theme_slug ?? config?.themeSlug ?? config?.palette ?? STORE_THEMES[0].slug;
  return THEME_ALIASES[slug] ?? slug;
}

export function getHeroVideoUrl(config?: StoreThemeConfig | null): string | null {
  return config?.hero_video_url ?? config?.heroVideoUrl ?? null;
}

export function getHeroMotion(config?: StoreThemeConfig | null): StoreHeroMotion {
  return config?.hero_motion ?? config?.heroMotion ?? getStoreTheme(getThemeSlug(config)).heroMotion;
}

export function themeToConfig(theme: StoreTheme, heroVideoUrl?: string | null): StoreThemeConfig {
  return {
    theme_slug: theme.slug,
    palette: theme.slug,
    primary: theme.primary,
    accent: theme.accent,
    background: theme.background,
    foreground: theme.foreground,
    muted: theme.muted,
    muted_foreground: theme.mutedForeground,
    card: theme.card,
    border: theme.border,
    hero_motion: theme.heroMotion,
    hero_video_url: heroVideoUrl?.trim() || null,
  };
}

export function themeCssVariables(config?: StoreThemeConfig | null): Record<string, string> {
  const theme = getStoreTheme(getThemeSlug(config));
  return {
    "--primary": config?.primary ?? theme.primary,
    "--accent": config?.accent ?? theme.accent,
    "--background": config?.background ?? theme.background,
    "--foreground": config?.foreground ?? theme.foreground,
    "--muted": config?.muted ?? theme.muted,
    "--muted-foreground": config?.muted_foreground ?? config?.mutedForeground ?? theme.mutedForeground,
    "--card": config?.card ?? theme.card,
    "--border": config?.border ?? theme.border,
    "--primary-foreground": "#ffffff",
    "--accent-foreground": "#ffffff",
  };
}
