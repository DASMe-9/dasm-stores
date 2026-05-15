/**
 * Injects merchant theme tokens into :root (SSR-safe).
 * Keys from API may be `primary` or `--primary`; both normalize to `--primary`.
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

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `:root { ${css} }`,
      }}
    />
  );
}
