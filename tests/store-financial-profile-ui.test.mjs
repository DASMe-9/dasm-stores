import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("seller financial page uses the governed profile endpoints and readiness stages", async () => {
  const api = await readFile(new URL("../lib/api.ts", import.meta.url), "utf8");
  const page = await readFile(
    new URL("../pages/dashboard/payment.tsx", import.meta.url),
    "utf8",
  );

  assert.match(api, /getFinancialProfile:\s*\(\)\s*=>\s*api\.get\("\/my-store\/financial-profile"\)/);
  assert.match(
    api,
    /updateFinancialProfile:\s*\(data:\s*JsonRecord\)\s*=>\s*api\.put\("\/my-store\/financial-profile",\s*data\)/,
  );
  assert.match(page, /type ProfileStage = "missing" \| "draft" \| "review" \| "ready"/);
  assert.match(page, /بيانات المنشأة/);
  assert.match(page, /مراجعة داسم/);
  assert.match(page, /جاهزية الدفع/);
  assert.match(page, /داسم وكيل تحصيل مفصح عنه/);
  assert.match(page, /المتجر هو مُصدر الفاتورة للمشتري/);
  assert.match(page, /setProfileSuccess/);
  assert.doesNotMatch(page, /name=["']accounting_entity_id["']/);
});

test("saving seller legal data resets no administrative field from the browser", async () => {
  const page = await readFile(
    new URL("../pages/dashboard/payment.tsx", import.meta.url),
    "utf8",
  );
  const savePayload = page.slice(
    page.indexOf("await sellerApi.updateFinancialProfile"),
    page.indexOf("const nextProfile", page.indexOf("await sellerApi.updateFinancialProfile")),
  );

  assert.match(savePayload, /legal_name_ar/);
  assert.match(savePayload, /registration_type/);
  assert.match(savePayload, /vat_registration_status/);
  assert.doesNotMatch(savePayload, /accounting_entity_id/);
  assert.doesNotMatch(savePayload, /verified_at/);
});
