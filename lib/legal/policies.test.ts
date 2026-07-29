import { describe, expect, it } from "vitest";
import type { StoreFulfillmentPolicy, StorePublic } from "@/lib/api-server";
import { getPolicyDoc } from "./policies";

const store = {
  id: 1,
  name: "Test Store",
  slug: "test",
  description: null,
  logo_url: null,
  banner_url: null,
  contact_phone: null,
  contact_email: null,
  contact_whatsapp: null,
  social_links: null,
  owner_type: "user",
  tabs: [],
} satisfies StorePublic;

const fulfillmentPolicy = {
  version: 1,
  title: "السياسة",
  store_name: "متجر",
  summary: "ملخص مخصص",
  fulfillment_model: "mixed",
  shipping_scope: "both",
  return_window_days: 10,
  merchant_response_business_days: 2,
  inspection_business_days: 3,
  resolution_business_days: 7,
  failed_delivery_confirmation_days: 3,
  customer_return_shipping: "customer",
  allow_exchange: true,
  allow_store_credit: false,
  responsibilities: [{ party: "التاجر", body: "مسؤول عن الحل." }],
  sections: [
    { key: "ordinary_return", title: "الاسترجاع", paragraphs: ["خلال 10 أيام."] },
    { key: "failed_delivery", title: "تعذر التسليم", paragraphs: ["تعاد المحاولة."] },
    { key: "mandatory_rights", title: "الحقوق", paragraphs: ["محفوظة."] },
  ],
} satisfies StoreFulfillmentPolicy;

describe("store policy documents", () => {
  it("uses the store-specific return policy", () => {
    const document = getPolicyDoc("returns", store, fulfillmentPolicy);
    expect(document.intro).toBe("ملخص مخصص");
    expect(document.sections.some((section) => section.heading === "الاسترجاع")).toBe(true);
    expect(document.sections.some((section) => section.heading === "تعذر التسليم")).toBe(false);
  });

  it("shows responsibilities and failed delivery in shipping", () => {
    const document = getPolicyDoc("shipping", store, fulfillmentPolicy);
    expect(document.sections[0].heading).toBe("مسؤوليات الأطراف");
    expect(document.sections.some((section) => section.heading === "تعذر التسليم")).toBe(true);
  });
});
