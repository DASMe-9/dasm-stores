export type StoreDisplayFields = {
  name?: string | null;
  name_ar?: string | null;
};

export function getStoreDisplayName(store?: StoreDisplayFields | null): string {
  return store?.name_ar?.trim() || store?.name?.trim() || "";
}
