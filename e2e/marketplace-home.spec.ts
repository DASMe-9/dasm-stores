import { expect, test } from "@playwright/test";

test.describe("الصفحة الرئيسية لمتاجر داسم", () => {
  test("تعرض أطروحة المنصة ومساري المتسوق وصاحب المتجر", async ({
    page,
  }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    expect(response?.status()).toBeLessThan(500);

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

    const hero = page.getByTestId("platform-hero");
    await expect(
      hero.getByRole("heading", {
        level: 1,
        name: "من متجر سعودي مستقل، إلى سوق أكبر.",
      }),
    ).toBeVisible();
    await expect(
      hero.getByRole("link", { name: "أنشئ متجرك" }),
    ).toHaveAttribute("href", "/auth/signup");
    await expect(
      hero.getByRole("link", { name: "استكشف السوق" }),
    ).toHaveAttribute("href", "#stores");
  });

  test("البحث وفلتر المعارض يحملان عقودًا واضحة", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(
      page.getByRole("textbox", { name: "ابحث عن منتج أو متجر" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "معارض معارض ومنشآت بيع" }),
    ).toHaveAttribute("href", "/?owner_type=venue_owner");
  });

  test("التنقل الهاتفي يتيح إنشاء متجر دون إخفاء السوق", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const mobileNav = page.getByRole("navigation", {
      name: "التنقل على الهاتف",
    });
    await expect(mobileNav).toBeVisible();
    await expect(
      mobileNav.getByRole("link", { name: "المتاجر" }),
    ).toHaveAttribute("href", "#stores");
    await expect(
      mobileNav.getByRole("link", { name: "أنشئ متجرك" }),
    ).toHaveAttribute("href", "/auth/signup");
  });
});
