import type { StorePublic } from "@/lib/api-server";
import { THEME_PRESETS } from "./presets";
import { presetToStoreTheme } from "./to-store-theme";
import { resolvePresetIdFromLegacyThemeId } from "./resolve-theme-id";
import { pickReadableForeground, pickReadableTextColor } from "./color-contrast";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as JsonObject;
}

function hasEntries(value: Record<string, string> | null | undefined): value is Record<string, string> {
  return Boolean(value && Object.keys(value).length > 0);
}

function findPresetById(id: string | null | undefined) {
  if (!id) return undefined;
  return THEME_PRESETS.find((preset) => preset.id === id);
}

function detectPresetFromThemeConfig(themeConfig: Record<string, unknown> | null | undefined) {
  const presetId = themeConfig?.preset_id;
  if (typeof presetId === "string") return findPresetById(presetId);
  const palette = themeConfig?.palette;
  if (typeof palette === "string") return findPresetById(palette);
  return undefined;
}

function readVar(vars: Record<string, string>, key: string): string | null {
  return vars[key] ?? vars[`--${key}`] ?? null;
}

function writeVarIfMissing(vars: Record<string, string>, key: string, value: string) {
  if (vars[key] || vars[`--${key}`]) return;
  vars[key] = value;
}

function withDerivedVars(vars: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!vars) return undefined;

  const next = { ...vars };
  const primary = readVar(next, "primary");
  const accent = readVar(next, "accent");
  const foreground = readVar(next, "foreground") ?? "#18181b";
  const card = readVar(next, "card") ?? "#ffffff";
  const background = readVar(next, "background") ?? "#fafafa";

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

function pickPreset(store: StorePublic) {
  const storeThemeConfig = asObject(store.theme_config);
  const fromStoreConfig = detectPresetFromThemeConfig(storeThemeConfig);
  if (fromStoreConfig) return fromStoreConfig;

  const themeTemplateConfig = asObject(store.theme?.template_config);
  const fromThemeTemplate = detectPresetFromThemeConfig(themeTemplateConfig);
  if (fromThemeTemplate) return fromThemeTemplate;

  if (store.theme?.slug) {
    const fromThemeSlug = findPresetById(store.theme.slug);
    if (fromThemeSlug) return fromThemeSlug;
  }

  const fromThemeId = findPresetById(resolvePresetIdFromLegacyThemeId(store.theme_id));
  if (fromThemeId) return fromThemeId;

  return undefined;
}

export function resolveStoreCssVariables(store: StorePublic): Record<string, string> | undefined {
  const preset = pickPreset(store);
  const fromPreset = preset ? presetToStoreTheme(preset).css_variables : undefined;
  const fromTheme = store.theme?.css_variables ?? undefined;

  if (hasEntries(fromTheme)) {
    return withDerivedVars(fromPreset ? { ...fromPreset, ...fromTheme } : fromTheme);
  }

  return withDerivedVars(fromPreset);
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
