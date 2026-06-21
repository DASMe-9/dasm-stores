# Spec: badge عداد المفضلة في هيدر الصفحة الرئيسية

**التاريخ:** 2026-06-21
**المصدر:** ideas-backlog 2026-06-13 + Salla Twilight v2.14.400 wishlist platform hooks (W29)
**الأولوية:** متوسطة-عالية — الحلقة المفقودة بين specs القلب على البطاقات (W26-W27) وتجربة المفضلة الكاملة

---

## السياق والمبرر

specs المفضلة المعلقة (`product-tile-wishlist-2026-06-11.md` و`product-card-store-wishlist-2026-06-12.md`) تضيف أيقونة قلب على كل بطاقة منتج. حين ينقر المتسوق على القلب، يُحفظ المنتج في `localStorage` — لكن لا يوجد أي مكان يُعرض فيه **عدد المفضلة** أو **مسار للوصول إليها** من الهيدر.

بدون badge في الهيدر، المفضلة تصبح "بئراً مظلمة": المتسوق يحفظ منتجات ثم يفقد إمكانية الوصول إليها بسهولة.

نمط المنافسين الراسخ (Salla wishlist platform hooks 2026، Shopify Dawn wishlist 2024+): badge رقمي على أيقونة القلب في الهيدر، ينقر عليها يفتح قائمة أو صفحة المفضلة.

---

## الحالة الراهنة في dasm-stores

**الملفات المعنية:**
- `components/home/HomeHeaderActions.tsx` — Client Component يعرض: ThemeToggle + auth menu + cart icon

**السلوك الحالي:**
```
[ThemeToggle]  [حسابي ▾]  [🛒]          ← للمسجل
[ThemeToggle]  [افتح متجرك]  [تسجيل الدخول]  [🛒]   ← للضيف (بعد spec W29)
```

لا يوجد أيقونة قلب ولا badge عداد في الهيدر. المفضلة مخزّنة في `localStorage` (وفق specs W26-W27) لكن لا مدخل بصري لها.

**state المفضلة الحالي (وفق specs W26-W27):**
```typescript
// localStorage key: "dasm_wishlist"
// value: string[] — مصفوفة product IDs
```

---

## التغيير المقترح

### TypeScript signature (لا تغيير على الـ props)

```typescript
export function HomeHeaderActions({ shoppingHref }: { shoppingHref: string })
```

### إضافة WishlistBadge داخل HomeHeaderActions

```typescript
function WishlistBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function sync() {
      try {
        const raw = localStorage.getItem("dasm_wishlist");
        const ids: string[] = raw ? JSON.parse(raw) : [];
        setCount(ids.length);
      } catch {
        setCount(0);
      }
    }

    sync();
    window.addEventListener("storage", sync);
    // custom event يُطلَق من بطاقات المنتج عند التغيير
    window.addEventListener("wishlist-updated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wishlist-updated", sync);
    };
  }, []);

  return (
    <Link
      href="/wishlist"
      aria-label={`المفضلة${count > 0 ? ` — ${count} منتج` : ""}`}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 shadow-sm transition hover:border-emerald-200 dark:hover:border-emerald-800 hover:text-emerald-700 dark:hover:text-emerald-300"
    >
      <Heart className="h-4 w-4" />
      {count > 0 ? (
        <span
          className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-emerald-600 px-1 text-[10px] font-bold text-white"
          aria-hidden
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
```

### الموضع في JSX

يُضاف `<WishlistBadge />` **بعد** cart icon أو **قبله** — اقتراح: قبل `ShoppingCart` لتكون المفضلة (قلب) يسار السلة (عربة) في RTL:

```
[ThemeToggle]  [...auth...]  [❤️ badge]  [🛒]
```

### variants

| الحالة | السلوك |
|--------|--------|
| مفضلة فارغة (`count === 0`) | أيقونة قلب بلا badge |
| مفضلة تحتوي 1-99 منتج | badge رقمي emerald-600 |
| مفضلة ≥100 منتج | badge يعرض "99+" |
| SSR (server render) | `count` يبدأ بـ 0 — لا hydration mismatch |

### custom event للمزامنة الآنية

بطاقات المنتج (specs W26-W27) يجب أن تُطلق حدثاً عند التغيير لتحديث badge فوراً دون الاعتماد على `storage` event فقط:

```typescript
// في product card wishlist toggle
window.dispatchEvent(new Event("wishlist-updated"));
```

---

## معايير القبول

- [ ] badge يظهر فقط عندما `count > 0`
- [ ] badge يُحدَّث فوراً عند إضافة/إزالة منتج من المفضلة (عبر `wishlist-updated` event)
- [ ] badge يُحدَّث عند `storage` event (مزامنة بين tabs)
- [ ] `count` يبدأ بـ 0 في SSR — لا hydration flash
- [ ] النقر على أيقونة القلب يوجه إلى `/wishlist` (صفحة المفضلة)
- [ ] `aria-label` يعكس العدد لإمكانية الوصول
- [ ] الموضع: قبل أيقونة السلة في الترتيب المرئي
- [ ] لا تأثير على auth menu أو ThemeToggle

---

## الملفات التي سيلمسها Cursor

| الملف | نوع التغيير |
|-------|------------|
| `components/home/HomeHeaderActions.tsx` | **تعديل** — إضافة `WishlistBadge` component داخل الملف + import `Heart` من lucide-react |
| `components/product/ProductTile` (في `app/page.tsx`) | **تعديل** — إضافة `dispatchEvent("wishlist-updated")` عند toggle المفضلة (بعد spec W26) |
| `components/product/ProductCard.tsx` | **تعديل** — نفس dispatch event (بعد spec W27) |

**ملاحظة للتنفيذ:** هذا الـ spec يُكمل specs القلب W26-W27 — التنفيذ المثالي يجمعها في خطوة واحدة.

---

## مخاطر التغيير

1. **صفحة `/wishlist` غير موجودة:** الـ badge سيوجه إلى صفحة 404 حتى تُنشأ. الحل: Cursor ينشئ `app/wishlist/page.tsx` (صفحة بسيطة تقرأ `localStorage["dasm_wishlist"]` وتعرض المنتجات) في نفس الـ PR.

2. **مزامنة localStorage:** `storage` event لا يُطلَق داخل نفس الـ tab. لذا custom event `wishlist-updated` ضروري لتحديث البادج فورياً.

3. **hydration mismatch:** `count` يبدأ بـ 0 في SSR — `localStorage` لا يُقرأ على الخادم. الـ `useEffect` يُصلح هذا لحظة mount بدون flash.

---

## استثناء: لا تمس

- `docs/design/baseline/`
- tokens في `tailwind.config`
- `app/page.tsx` (الـ Hero + nav + sections) — التغيير في `HomeHeaderActions.tsx` فقط
- أي مكوّن خارج النطاق المذكور أعلاه
