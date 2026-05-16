import { themeCssVariables, type StoreThemeConfig } from "@/lib/store-themes";

/**
 * Injects merchant theme tokens into :root (SSR-safe).
 * Keys from API may be `primary` or `--primary`; both normalize to `--primary`.
 */
export function StoreThemeApplier({
  vars,
  config,
}: {
  vars: Record<string, string> | null | undefined;
  config?: StoreThemeConfig | null | undefined;
}) {
  const resolvedVars = {
    ...(config ? themeCssVariables(config) : {}),
    ...(vars ?? {}),
  };

  if (Object.keys(resolvedVars).length === 0) return null;

  const css = Object.entries(resolvedVars)
    .map(([k, v]) => {
      const key = k.startsWith("--") ? k : `--${k}`;
      return `${key}: ${v};`;
    })
    .join(" ");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { ${css} }`,
      }}
    />
  );
}
