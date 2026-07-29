import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const dashboard = readFileSync("pages/dashboard/policies.tsx", "utf8");
const productPage = readFileSync("app/[slug]/products/[productId]/page.tsx", "utf8");
const defaults = [
  readFileSync("lib/themes/blocks/schema.ts", "utf8"),
  readFileSync("lib/themes/blocks/section-library.ts", "utf8"),
  readFileSync("lib/themes/blocks/templates.ts", "utf8"),
].join("\n");

describe("store fulfillment policy interface", () => {
  it("lets the merchant configure the required operational choices", () => {
    for (const field of [
      "fulfillment_model",
      "shipping_scope",
      "return_window_days",
      "failed_delivery_confirmation_days",
      "customer_return_shipping",
    ]) {
      expect(dashboard).toContain(field);
    }
  });

  it("shows the customer direct policy links on product pages", () => {
    expect(productPage).toContain("/p/returns");
    expect(productPage).toContain("/p/shipping");
    expect(productPage).toContain("العيب أو الخطأ أو التلف");
  });

  it("does not promise an invented fourteen-day return window", () => {
    expect(defaults).not.toContain("نعم خلال ١٤ يوماً");
    expect(defaults).not.toContain("إرجاع سهل");
  });
});
