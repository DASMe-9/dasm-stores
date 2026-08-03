import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const page = await readFile(
  new URL("../pages/dashboard/supplier-catalog.tsx", import.meta.url),
  "utf8",
);

test("supplier catalog sends Laravel-compatible filters", () => {
  assert.match(page, /in_stock:\s*1/);
  assert.doesNotMatch(page, /in_stock:\s*true/);
  assert.match(page, /q:\s*query \|\| undefined/);
  assert.match(page, /category:\s*category \|\| undefined/);
  assert.match(page, /page,\s*\n\s*per_page:\s*24/);
});

test("supplier catalog distinguishes expected access and runtime failures", () => {
  assert.match(page, /supplier_catalog_store_suspended/);
  assert.match(page, /لا يمكن استخدام كتالوج الموردين لأن المتجر معلّق حاليًا/);
  assert.match(page, /supplier_catalog_subscription_required/);
  assert.match(page, /يتاح كتالوج الموردين بعد اعتماد المتجر أو خلال الفترة التجريبية السارية/);
  assert.match(page, /تعذر تطبيق عوامل البحث/);
  assert.match(page, /خدمة كتالوج الموردين غير متاحة مؤقتًا/);
  assert.match(page, /تعذر الاتصال بخدمة كتالوج الموردين/);
  assert.match(page, /setMessage\(\(current\) => \(current\?\.error \? null : current\)\)/);
  assert.doesNotMatch(page, /typed\.response\?\.data\?\.message \?\? "تعذر تحميل كتالوج الموردين حاليًا\."/);
});

test("supplier catalog keeps search category pagination and truthful empty state", () => {
  assert.match(page, /submitSearch/);
  assert.match(page, /setCategory\(event\.target\.value\)/);
  assert.match(page, /setPage\(\(current\) => current \+ 1\)/);
  assert.match(page, /لا توجد منتجات مطابقة حاليًا/);
  assert.match(page, /catalog\.meta\.total/);
});
