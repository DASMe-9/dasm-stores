# خطة نقل جداول المتاجر → schema `stores` (بدون ليدجر في Services)

> **ليدجر + Auth:** `STORES_LEDGER_AND_AUTH_ARCHITECTURE.md` — الليدجر يبقى على **DASM-core** فقط.

## الهدف

- نقل بيانات المتجر التشغيلية تدريجياً من `public.store_*` إلى `stores.*` على **DASM-core** (ومرايا تشغيلية على **DASM-services** للثيمات).
- الإبقاء على `public.store_themes` مؤقتاً لـ Laravel `theme_id`.

## ما اكتمل (2026-05-20)

- Schema `stores` + `theme_presets` (20) على core و services.
- Theme Builder في `dasm-stores` (`/dashboard/theme`).

## مراحل لاحقة

1. **B:** قراءة مزدوجة Laravel للثيم من `stores.theme_presets`.
2. **C–E:** نقل `stores`, `products`, `orders` مع `legacy_*_id`.
3. **Ledger (Core فقط):** توحيد `StoreCommissionService` → `FinancialLedgerService` + COA متاجر.
