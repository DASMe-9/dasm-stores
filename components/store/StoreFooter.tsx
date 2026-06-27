import Link from "next/link";
import type { StorePublic } from "@/lib/api-server";
import { POLICY_LINKS } from "@/lib/legal/policies";

/**
 * Standard storefront footer — store identity, contact channels, the legal
 * pages a KSA store is expected to publish (من نحن / الشروط / الخصوصية /
 * الاستبدال والاسترجاع / الشحن / اتصل بنا), accepted payment methods, and the
 * «مدعوم بواسطة متاجر داسم» attribution.
 */
export function StoreFooter({
  store,
  slug,
  storeName,
}: {
  store: StorePublic;
  slug: string;
  storeName: string;
}) {
  const waDigits = store.contact_whatsapp?.replace(/[^\d]/g, "") ?? "";

  const contacts: { href: string; label: string }[] = [];
  if (store.contact_phone) contacts.push({ href: `tel:${store.contact_phone}`, label: store.contact_phone });
  if (waDigits) contacts.push({ href: `https://wa.me/${waDigits}`, label: "واتساب" });
  if (store.contact_email) contacts.push({ href: `mailto:${store.contact_email}`, label: store.contact_email });

  return (
    <footer
      dir="rtl"
      className="mt-[var(--space-8)] border-t border-[var(--c-line)] bg-[var(--c-surface)] text-sm text-[var(--c-muted)]"
    >
      <div className="mx-auto grid w-full max-w-[1600px] gap-[var(--space-8)] px-[var(--space-4)] py-10 sm:px-[var(--space-6)] lg:grid-cols-3 lg:px-[var(--space-8)]">
        {/* Identity */}
        <div className="space-y-[var(--space-2)]">
          <h3 className="text-base font-bold text-[var(--c-text)]">{storeName}</h3>
          {store.description && <p className="line-clamp-3 leading-6">{store.description}</p>}
        </div>

        {/* Legal pages */}
        <nav aria-label="روابط مهمة" className="space-y-2">
          <h4 className="text-sm font-bold text-[var(--foreground)]">روابط مهمة</h4>
          <ul className="space-y-[var(--space-2)]">
            {POLICY_LINKS.map((link) => (
              <li key={link.key}>
                <Link
                  href={`/${slug}/p/${link.key}`}
                  className="transition-colors hover:text-[var(--c-text)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contact + payments */}
        <div className="space-y-[var(--space-3)]">
          <div className="space-y-[var(--space-2)]">
            <h4 className="text-sm font-bold text-[var(--foreground)]">تواصل معنا</h4>
            {contacts.length > 0 ? (
              <ul className="space-y-[var(--space-2)]">
                {contacts.map((c) => (
                  <li key={c.href}>
                    <a href={c.href} className="transition-colors hover:text-[var(--c-text)]" dir="ltr">
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>تواصل معنا عبر صفحة المتجر.</p>
            )}
          </div>
          <div className="space-y-[var(--space-2)]">
            <h4 className="text-sm font-bold text-[var(--foreground)]">وسائل الدفع</h4>
            <p className="text-xs">مدى · Visa · Mastercard · Apple Pay</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--c-line)] py-[var(--space-4)]">
        <span className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-center gap-[var(--space-2)] px-[var(--space-4)] text-xs">
          <span>{storeName}</span>
          <span aria-hidden="true">—</span>
          <span>مدعوم بواسطة</span>
          <a
            href="https://dasm.com.sa"
            className="font-semibold text-[var(--c-brand)] hover:underline"
          >
            متاجر داسم
          </a>
        </span>
      </div>
    </footer>
  );
}
