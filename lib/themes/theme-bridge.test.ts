import { describe, it, expect } from "vitest";
import { presetToThemeConfig, designToChromeThemeConfig, findPresetById } from "@/lib/themes";

const preset = findPresetById("auto-luxury-showroom")!;

describe("presetToThemeConfig — non-destructive save", () => {
  it("preserves an existing editor document when applying a preset", () => {
    const existing = {
      editor: { version: 3, surfaces: { landing: "<hero/>", products: "<product-grid/>" } },
      foo: "bar",
    };
    const result = presetToThemeConfig(preset, existing) as Record<string, unknown>;
    expect(result.editor).toEqual(existing.editor);
    expect(result.foo).toBe("bar");
    // preset keys still overwrite/added
    expect(result.preset_id).toBe(preset.id);
    expect(result.primary).toBe(preset.colors.primary);
  });

  it("works without a base (legacy callers) and yields preset keys", () => {
    const result = presetToThemeConfig(preset) as Record<string, unknown>;
    expect(result.editor).toBeUndefined();
    expect(result.preset_id).toBe(preset.id);
  });

  it("lets the preset override stale colour keys from the base", () => {
    const existing = { primary: "#000000", editor: { version: 3, surfaces: {} } };
    const result = presetToThemeConfig(preset, existing) as Record<string, unknown>;
    expect(result.primary).toBe(preset.colors.primary);
    expect(result.editor).toEqual(existing.editor);
  });
});

describe("designToChromeThemeConfig — design → chrome colour bridge", () => {
  it("mirrors a valid hex themeColor onto the chrome primary var", () => {
    expect(designToChromeThemeConfig({ themeColor: "#059669" })).toEqual({ primary: "#059669" });
  });

  it("accepts short hex and trims whitespace", () => {
    expect(designToChromeThemeConfig({ themeColor: "  #abc  " })).toEqual({ primary: "#abc" });
  });

  it("returns nothing for missing or invalid colours", () => {
    expect(designToChromeThemeConfig({ themeColor: "" })).toEqual({});
    expect(designToChromeThemeConfig({ themeColor: "rebeccapurple" })).toEqual({});
    expect(designToChromeThemeConfig({})).toEqual({});
    expect(designToChromeThemeConfig(null)).toEqual({});
    expect(designToChromeThemeConfig(undefined)).toEqual({});
  });
});
