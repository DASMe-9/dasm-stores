import type { StorePublic, StoreShippingConfig } from "@/lib/api-server";

export function pickShippingConfigs(
  store: StorePublic & {
    shipping_configs?: StoreShippingConfig[];
    shippingConfigs?: StoreShippingConfig[];
  },
): StoreShippingConfig[] {
  const list = store.shipping_configs ?? store.shippingConfigs ?? [];
  return list.filter((s) => s.is_active !== false);
}
