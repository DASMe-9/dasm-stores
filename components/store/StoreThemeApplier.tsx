/**
 * Injects merchant theme tokens on the storefront scope. Keys from API may be
 * `c-bg`, `--c-bg`, `primary` or `--primary`; all normalize to CSS variables.
 *
 * Keep this scoped away from :root so dashboard/auth surfaces keep their own
 * theme. Storefront preset switching is tenant-driven, not tied to global dark
 * mode.
 */
export function StoreThemeApplier({
  vars,
}: {
  vars: Record<string, string> | null | undefined;
}) {
  if (!vars || Object.keys(vars).length === 0) return null;

  const allowedKeys = new Set([
    "c-bg",
    "c-surface",
    "c-surface-2",
    "c-text",
    "c-muted",
    "c-line",
    "c-brand",
    "c-on-brand",
    "c-accent",
    "c-sale",
    "font-display",
    "font-body",
    "r-sm",
    "r",
    "r-lg",
    "r-pill",
    "space-1",
    "space-2",
    "space-3",
    "space-4",
    "space-5",
    "space-6",
    "space-8",
    "shadow-sm",
    "shadow",
    "shadow-lg",
    "background",
    "foreground",
    "primary",
    "primary-foreground",
    "primary-text",
    "accent",
    "accent-foreground",
    "muted",
    "muted-foreground",
    "card",
    "border",
    "font-family-ar",
    "font-family-en",
    "heading-weight",
    "product-card-style",
    "header-style",
    "preset-id",
  ]);

  const css = Object.entries(vars)
    .map(([k, v]) => [k.replace(/^--/, ""), v.trim()] as const)
    .filter(([key, value]) => allowedKeys.has(key) && value.length > 0 && !/[;{}<>]/.test(value))
    .map(([key, value]) => `--${key}: ${value};`)
    .join(" ");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `.store-front-root { ${css} }`,
      }}
    />
  );
}
