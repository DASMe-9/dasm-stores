# Design Guardian Route — إعدادات الراوت الرسمية

**آخر تحديث:** 2026-06-06

## الإعدادات في واجهة Claude Code

| الحقل | القيمة |
|-------|--------|
| Name | dasm-stores — Design Guardian & Spec Generator |
| Repository | DASMe-9/dasm-stores |
| Schedule | At 09:00, every Sunday |
| Connectors | exa + Figma + Sentry فقط |

## تصحيحات المسارات

البرومبت يستخدم مسارات مُبسَّطة — الراوت يجب أن يقرأ الملفات من المسارات الفعلية:

| المسار في البرومبت | المسار الفعلي |
|---|---|
| `docs/design/baseline/marketplace-home.png` | `docs/design/baseline/screenshots/marketplace-home.png` |
| `docs/design/baseline/subdomain-store.png` | `docs/design/baseline/screenshots/subdomain-store.png` |
| `src/app/page.tsx` | `app/page.tsx` |
| `src/app/[storeSlug]/page.tsx` | `app/[slug]/page.tsx` |

> **ملاحظة للراوت:** إن كانت الصور غير موجودة في المسار المذكور في البرومبت، ابحث في `docs/design/baseline/screenshots/` أولاً قبل إنشاء `missing-baseline.md`.

## بنية المخرجات

```
docs/
├── research/
│   ├── ideas-backlog.md          ← أفكار مرجأة (لا تُنفَّذ مباشرةً)
│   ├── baseline-drift-*.md       ← تقارير الانحراف البصري
│   ├── competitors/
│   │   └── {YYYY-WW}.md         ← تقارير أسبوعية (delta فقط)
│   └── security-incident-*.md    ← حوادث أمنية (prompt injection)
└── specs/
    └── {component}-{YYYY-MM-DD}.md  ← spec واحد لكل تشغيلة
```
