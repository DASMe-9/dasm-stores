import { expect, test } from "@playwright/test";

const SLUG = "cheerlylive";
const OWNER_TOKEN = process.env.DASM_STORES_E2E_TOKEN?.trim();

test.describe("Cheerly Live — إنتاج stores.dasm.com.sa", () => {
  test("الاستكشاف يحمّل دون خطأ خادم", async ({ page }) => {
    const res = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("معاينة بدون تسجيل دخول: لا 500 — يطلب تسجيل الدخول أو يوضح غياب المتجر", async ({
    page,
  }) => {
    const apiStatuses: number[] = [];
    page.on("response", (r) => {
      const u = r.url();
      if (u.includes(`/api/public-store/${SLUG}`) && u.includes("preview=true")) {
        apiStatuses.push(r.status());
      }
    });

    await page.goto(`/${SLUG}?preview=true`, { waitUntil: "networkidle" });

    for (const status of apiStatuses) {
      expect(status, "استدعاء معاينة المتجر لا يجب أن يرجع 500").not.toBe(500);
    }

    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/تعذّر تحميل المعاينة \(500\)/);

    const login = page.getByRole("link", { name: "تسجيل الدخول" });
    const missing = page.getByRole("heading", { name: "المتجر غير متاح" });
    await expect(login.or(missing).first()).toBeVisible({ timeout: 20_000 });
  });

  test("واجهة عامة للمسودة: لا محتوى متجر كامل بدون نشر", async ({ page }) => {
    await page.goto(`/${SLUG}`, { waitUntil: "networkidle" });
    const title = await page.title();
    expect(title).toMatch(/غير موجود|متجر/i);
  });

  test.describe("مالك مسجّل (يتطلب DASM_STORES_E2E_TOKEN)", () => {
    test.skip(!OWNER_TOKEN, "عيّن DASM_STORES_E2E_TOKEN لتشغيل اختبار المالك");

    test.use({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: process.env.PLAYWRIGHT_BASE_URL ?? "https://stores.dasm.com.sa",
            localStorage: [{ name: "stores_token", value: OWNER_TOKEN! }],
          },
        ],
      },
    });

    test("معاينة المالك: API ناجح واسم المتجر ظاهر", async ({ page }) => {
      let previewStatus = 0;
      page.on("response", async (r) => {
        const u = r.url();
        if (u.includes(`/api/public-store/${SLUG}`) && u.includes("preview=true")) {
          previewStatus = r.status();
        }
      });

      await page.goto(`/${SLUG}?preview=true`, { waitUntil: "networkidle" });

      expect(previewStatus, "معاينة المالك يجب أن تنجح بعد إصلاح الباكند").toBe(200);

      const body = await page.locator("body").innerText();
      expect(body).not.toMatch(/تعذّر تحميل المعاينة \(500\)/);
      expect(body).toMatch(/البساطه|cheerly/i);
    });

    test("لوحة الإعدادات: اسم المتجر ومسودة", async ({ page }) => {
      await page.goto("/dashboard/settings", { waitUntil: "networkidle" });
      await expect(page.getByText(/متجر البساطه|cheerly/i).first()).toBeVisible();
      await expect(page.getByText(/مسودة/).first()).toBeVisible();
    });

    test("صفحة المنتجات: ثلاث سلع على الأقل", async ({ page }) => {
      await page.goto("/dashboard/products", { waitUntil: "networkidle" });
      const heading = page.getByText(/جميع المنتجات \(\d+\)/);
      await expect(heading).toBeVisible({ timeout: 20_000 });
      const text = (await heading.textContent()) ?? "";
      const m = text.match(/\((\d+)\)/);
      expect(m).not.toBeNull();
      expect(Number(m![1])).toBeGreaterThanOrEqual(3);
    });
  });
});
