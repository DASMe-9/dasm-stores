/** Routes where floating third-party launchers (Talk, Vercel toolbar) must not appear. */
export function shouldHideFloatingWidgets(pathname: string): boolean {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/stores/new")
  );
}
