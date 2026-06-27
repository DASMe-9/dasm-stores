import type { StorePublic } from "@/lib/api-server";
import { THEME_PRESETS } from "./presets";
import { presetToStoreTheme } from "./to-store-theme";
import { resolvePresetIdFromLegacyThemeId } from "./resolve-theme-id";
import { pickReadableForeground, pickReadableTextColor } from "./color-contrast";
import {
  STOREFRONT_THEME_PRESETS,
  isStorefrontPresetId,
  legacyVarsFromTokens,
  storefrontPresetForCategory,
  storefrontPresetToTokens,
} from "./storefront-tokens";

type JsonObject = Record<string, unknown>;
const warnedDefaultPresetStores = new Set<string>();

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonObject;
}

function hasEntries(value: Record<string, string> | null | undefined): value is Record<string, string> {
  return Boolean(value && Object.keys(value).length > 0);
}

function findPresetById(id: string | null | undefined) {
  if (!id) return undefined;
  return STOREFRONT_THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS.find((preset) => preset.id === id);
}

function findStorefrontPresetById(id: string | null | undefined) {
  if (!isStorefrontPresetId(id)) return undefined;
  return STOREFRONT_THEME_PRESETS.find((preset) => preset.id === id);
}

function detectPresetFromThemeConfig(themeConfig: Record<string, unknown> | null | undefined) {
  const themePreset = themeConfig?.theme_preset;
  if (typeof themePreset === "string") return findStorefrontPresetById(themePreset);
  const presetId = themeConfig?.preset_id;
  if (typeof presetId === "string") return findStorefrontPresetById(presetId);
  const palette = themeConfig?.palette;
  if (typeof palette === "string") return findStorefrontPresetById(palette);
  return undefined;
}

function readVar(vars: Record<string, string>, key: string): string | null {
  return vars[key] ?? vars[`--${key}`] ?? null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readKey(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return readString(value);
}

function readLegacyThemeId(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function writeStringVar(vars: Record<string, string>, key: string, value: unknown) {
  const stringValue = readString(value);
  if (stringValue) vars[key] = stringValue;
}

function varsFromThemeConfig(themeConfig: Record<string, unknown> | null | undefined): Record<string, string> | undefined {
  if (!themeConfig) return undefined;

  const nestedVars = asObject(themeConfig.css_variables);
  const overrides = asObject(themeConfig.overrides);
  const presetId = readString(themeConfig.theme_preset) ?? readString(themeConfig.preset_id) ?? readString(themeConfig.palette);
  const hasLegacyPresetId = Boolean(presetId && !isStorefrontPresetId(presetId));
  const vars: Record<string, string> = {};

  for (const source of [nestedVars, overrides]) {
    if (!source) continue;
    for (const [key, value] of Object.entries(source)) {
      writeStringVar(vars, key.replace(/^--/, ""), value);
    }
  }

  if (!hasLegacyPresetId) {
    writeStringVar(vars, "primary", themeConfig.primary);
    writeStringVar(vars, "accent", themeConfig.accent);
    writeStringVar(vars, "background", themeConfig.background);
    writeStringVar(vars, "foreground", themeConfig.foreground);
    writeStringVar(vars, "card", themeConfig.card);
    writeStringVar(vars, "border", themeConfig.border);
    writeStringVar(vars, "muted", themeConfig.muted);
    writeStringVar(vars, "muted-foreground", themeConfig["muted-foreground"] ?? themeConfig.muted_foreground);
  }

  writeStringVar(vars, "c-bg", themeConfig["--c-bg"] ?? themeConfig.c_bg);
  writeStringVar(vars, "c-surface", themeConfig["--c-surface"] ?? themeConfig.c_surface);
  writeStringVar(vars, "c-surface-2", themeConfig["--c-surface-2"] ?? themeConfig.c_surface_2);
  writeStringVar(vars, "c-text", themeConfig["--c-text"] ?? themeConfig.c_text);
  writeStringVar(vars, "c-muted", themeConfig["--c-muted"] ?? themeConfig.c_muted);
  writeStringVar(vars, "c-line", themeConfig["--c-line"] ?? themeConfig.c_line);
  writeStringVar(vars, "c-brand", themeConfig["--c-brand"] ?? themeConfig.c_brand);
  writeStringVar(vars, "c-on-brand", themeConfig["--c-on-brand"] ?? themeConfig.c_on_brand);
  writeStringVar(vars, "c-accent", themeConfig["--c-accent"] ?? themeConfig.c_accent);
  writeStringVar(vars, "c-sale", themeConfig["--c-sale"] ?? themeConfig.c_sale);
  writeStringVar(vars, "product-card-style", themeConfig.product_card_style);
  writeStringVar(vars, "header-style", themeConfig.header_style);
  if (isStorefrontPresetId(presetId)) writeStringVar(vars, "preset-id", presetId);

  return Object.keys(vars).length > 0 ? vars : undefined;
}

function writeVarIfMissing(vars: Record<string, string>, key: string, value: string) {
  if (vars[key] || vars[`--${key}`]) return;
  vars[key] = value;
}

function withDerivedVars(vars: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!vars) return undefined;

  const next = { ...vars };
  const tokenPresetId = readVar(next, "preset-id");
  const tokenSource = storefrontPresetToTokens(isStorefrontPresetId(tokenPresetId) ? tokenPresetId : "quiet");
  const tokenLegacyVars = legacyVarsFromTokens(tokenSource);

  for (const [token, value] of Object.entries(tokenSource)) {
    writeVarIfMissing(next, token, value);
  }

  const bg = readVar(next, "c-bg");
  const surface = readVar(next, "c-surface");
  const surface2 = readVar(next, "c-surface-2");
  const text = readVar(next, "c-text");
  const muted = readVar(next, "c-muted");
  const line = readVar(next, "c-line");
  const brand = readVar(next, "c-brand");
  const onBrand = readVar(next, "c-on-brand");
  const accentToken = readVar(next, "c-accent");

  if (bg) next.background = bg;
  if (text) next.foreground = text;
  if (brand) next.primary = brand;
  if (onBrand) next["primary-foreground"] = onBrand;
  if (brand) next["primary-text"] = brand;
  if (accentToken) next.accent = accentToken;
  if (onBrand) next["accent-foreground"] = onBrand;
  if (surface) next.card = surface;
  if (line) next.border = line;
  if (surface2) next.muted = surface2;
  if (muted) next["muted-foreground"] = muted;

  for (const [key, value] of Object.entries(tokenLegacyVars)) {
    writeVarIfMissing(next, key, value);
  }

  const primary = readVar(next, "primary");
  const accent = readVar(next, "accent");
  const foreground = readVar(next, "foreground") ?? tokenLegacyVars.foreground;
  const card = readVar(next, "card") ?? tokenLegacyVars.card;
  const background = readVar(next, "background") ?? tokenLegacyVars.background;

  if (primary) {
    writeVarIfMissing(
      next,
      "primary-foreground",
      pickReadableForeground(primary, { dark: "#111827", light: "#ffffff" }),
    );
  }

  if (accent) {
    writeVarIfMissing(
      next,
      "accent-foreground",
      pickReadableForeground(accent, { dark: "#111827", light: "#ffffff" }),
    );
  }

  const primaryText = pickReadableTextColor([primary, accent, foreground], [card, background], foreground);
  writeVarIfMissing(next, "primary-text", primaryText);

  return next;
}

function storeCategoryKeys(store: StorePublic): string[] {
  const keys: string[] = [];
  const add = (value: unknown) => {
    const key = readKey(value);
    if (key && !keys.includes(key)) keys.push(key);
  };

  add(store.category_id);
  add(store.category_slug);

  const category = asObject(store.category);
  if (category) {
    add(category.id);
    add(category.slug);
    add(category.code);
    add(category.name);
    add(category.name_ar);
  } else {
    add(store.category);
  }

  return keys;
}

function warnDefaultPresetFallback(store: StorePublic, categoryKeys: string[]) {
  const storeKey = store.slug || String(store.id);
  if (warnedDefaultPresetStores.has(storeKey)) return;
  warnedDefaultPresetStores.add(storeKey);
  console.warn("[storefront-theme] Falling back to quiet preset", {
    store_id: store.id,
    store_slug: store.slug,
    category_keys: categoryKeys,
    theme_preset: store.theme_preset,
    theme_id: store.theme_id,
    theme_slug: store.theme?.slug,
  });
}

function pickPreset(store: StorePublic) {
  const storeThemeConfig = asObject(store.theme_config);
  const fromStorePreset = findStorefrontPresetById(store.theme_preset);
  if (fromStorePreset) return fromStorePreset;

  const fromStoreConfig = detectPresetFromThemeConfig(storeThemeConfig);
  if (fromStoreConfig) return fromStoreConfig;

  const categoryKeys = storeCategoryKeys(store);
  for (const key of categoryKeys) {
    const fromCategory = findPresetById(storefrontPresetForCategory(key));
    if (fromCategory) return fromCategory;
  }

  const themeTemplateConfig = asObject(store.theme?.template_config);
  const fromThemeTemplate = detectPresetFromThemeConfig(themeTemplateConfig);
  if (fromThemeTemplate) return fromThemeTemplate;

  if (store.theme?.slug) {
    const fromThemeSlug = findPresetById(store.theme.slug);
    if (fromThemeSlug) return fromThemeSlug;
  }

  const fromThemeId = findPresetById(resolvePresetIdFromLegacyThemeId(readLegacyThemeId(store.theme_id)));
  if (fromThemeId) return fromThemeId;

  warnDefaultPresetFallback(store, categoryKeys);
  return findPresetById("quiet");
}

export function resolveStoreCssVariables(store: StorePublic): Record<string, string> | undefined {
  const storeThemeConfig = asObject(store.theme_config);
  const preset = pickPreset(store);
  const fromPreset = preset ? presetToStoreTheme(preset).css_variables : undefined;
  const fromTheme = store.theme?.css_variables ?? undefined;
  const fromStoreConfig = varsFromThemeConfig(storeThemeConfig);

  if (fromPreset || hasEntries(fromTheme) || fromStoreConfig) {
    return withDerivedVars({
      ...(hasEntries(fromTheme) ? fromTheme : {}),
      ...(fromPreset ?? {}),
      ...(fromStoreConfig ?? {}),
    });
  }

  return undefined;
}

export function resolveStoreTemplateConfig(store: StorePublic): JsonObject | null {
  const preset = pickPreset(store);
  const fromPreset = preset ? presetToStoreTheme(preset).template_config : null;
  const fromTheme = asObject(store.theme?.template_config);
  const fromStore = asObject(store.theme_config);

  const merged: JsonObject = {
    ...(fromPreset ?? {}),
    ...(fromTheme ?? {}),
    ...(fromStore ?? {}),
  };

  return Object.keys(merged).length > 0 ? merged : null;
}
