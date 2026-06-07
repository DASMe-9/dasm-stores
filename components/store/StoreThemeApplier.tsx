/**
 * Injects merchant theme tokens on the storefront scope.
 * Keys from API may be `primary` or `--primary`; both normalize to `--primary`.
 *
 * Keep this scoped away from :root so the global `.dark` theme can still
 * switch checkout and storefront surfaces.
 */
export function StoreThemeApplier({
  vars,
}: {
  vars: Record<string, string> | null | undefined;
}) {
  if (!vars || Object.keys(vars).length === 0) return null;

  const css = Object.entries(vars)
    .map(([k, v]) => {
      const key = k.startsWith("--") ? k : `--${k}`;
      return `${key}: ${v};`;
    })
    .join(" ");

  const darkSurfaceCss = [
    "--background: #0a0a0a;",
    "--foreground: #ededed;",
    "--muted: #27272a;",
    "--muted-foreground: #a1a1aa;",
    "--card: #18181b;",
    "--border: #3f3f46;",
  ].join(" ");

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `.store-front-root { ${css} } .dark .store-front-root { ${darkSurfaceCss} }`,
      }}
    />
  );
}
