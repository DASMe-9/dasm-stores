import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, Package, Save, Trash2 } from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi } from "@/lib/api";
import { ProductMediaUploader, type MediaItem } from "@/components/seller/ProductMediaUploader";
import { ProductVariationsBuilder, type Variant, type ProductOption } from "@/components/seller/ProductVariationsBuilder";

interface ProductImage {
  id: string | number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface ProductData {
  id: string | number;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  weight: number | null;
  status: string;
  is_featured: boolean;
  category_id: number | null;
  images: ProductImage[];
  variants?: any[];
  category: { id: number; name: string } | null;
}

function reconstructOptions(variants: any[]): ProductOption[] {
  if (!variants || variants.length === 0) return [];
  const optionsMap = new Map<string, Set<string>>();
  for (const v of variants) {
    if (v.option_values) {
      for (const [key, val] of Object.entries(v.option_values)) {
        if (!optionsMap.has(key)) optionsMap.set(key, new Set());
        optionsMap.get(key)!.add(String(val));
      }
    }
  }
  const options: ProductOption[] = [];
  optionsMap.forEach((values, name) => {
    options.push({ name, values: Array.from(values) });
  });
  return options;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ready, setReady] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    sku: "",
    price: "",
    compare_at_price: "",
    weight: "",
    category_id: "",
    status: "active" as string,
    is_featured: false,
  });

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [originalImageIds, setOriginalImageIds] = useState<Set<string | number>>(new Set());
  const [removedImageIds, setRemovedImageIds] = useState<Array<string | number>>([]);
  
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [productVariants, setProductVariants] = useState<Variant[]>([]);

  const productId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/products");
      return;
    }
    setReady(true);
  }, [router]);

  const loadProduct = useCallback(async () => {
    if (!productId) return;

    setLoading(true);
    try {
      const [prodRes, catsRes] = await Promise.allSettled([
        sellerApi.getProduct(productId),
        sellerApi.getCategories(),
      ]);

      if (prodRes.status === "fulfilled") {
        const p = prodRes.value.data.product as ProductData;
        setProduct(p);
        
        const initialMedia: MediaItem[] = (p.images || []).map(img => ({
          id: img.id,
          url: img.url,
          is_primary: img.is_primary,
          alt_text: img.alt_text,
          type: "image",
        }));
        setMedia(initialMedia);
        setOriginalImageIds(new Set(initialMedia.map(m => m.id as string | number)));
        setRemovedImageIds([]);

        if (p.variants && p.variants.length > 0) {
          setProductOptions(reconstructOptions(p.variants));
          setProductVariants(p.variants);
        }

        setForm({
          name: p.name,
          description: p.description || "",
          sku: p.sku || "",
          price: String(p.price),
          compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
          weight: p.weight ? String(p.weight) : "",
          category_id: p.category_id ? String(p.category_id) : "",
          status: p.status,
          is_featured: p.is_featured,
        });
      }

      if (catsRes.status === "fulfilled") {
        const raw = (catsRes.value.data as { categories?: { id: number; name: string }[] })?.categories ?? [];
        setCategories(raw.map((x) => ({ id: x.id, name: x.name })));
      }
    } catch {
      setError("تعذّر تحميل المنتج");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (!ready || !productId) return;
    loadProduct();
  }, [loadProduct, ready, productId]);

  const handleRemoveExistingMedia = (id: string | number) => {
    if (originalImageIds.has(id)) {
      setRemovedImageIds((prev) => [...prev, id]);
    }
  };

  const submit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (!form.name.trim() || !form.price.trim()) {
        setError("الاسم والسعر مطلوبان.");
        setSaving(false);
        return;
      }

      const numericPrice = Number(form.price);

      const newImages = media
        .filter((m) => m.type === "image" && (!m.id || !originalImageIds.has(m.id)))
        .map((m) => ({ url: m.url, alt_text: m.alt_text, is_primary: m.is_primary }));

      const primaryImg = media.find((m) => m.is_primary && m.type === "image");
      const primaryImageId = primaryImg && primaryImg.id && originalImageIds.has(primaryImg.id) ? primaryImg.id : null;

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        sku: form.sku.trim() || null,
        price: numericPrice,
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        weight: form.weight ? Number(form.weight) : null,
        status: form.status,
        is_featured: form.is_featured,
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
        variants: productVariants.length > 0 ? productVariants.map(v => ({
           name: v.name,
           price: Number(v.price) || numericPrice,
           option_values: v.option_values,
           stock_quantity: v.stock_quantity || 0
        })) : [], // Empty array will clear variants if any were removed
      };

      if (removedImageIds.length > 0) payload.remove_image_ids = removedImageIds;
      if (newImages.length > 0) payload.images = newImages;
      if (primaryImageId) payload.primary_image_id = primaryImageId;

      if (!productId) {
        setError("معرف المنتج غير صالح.");
        return;
      }

      const { data } = await sellerApi.updateProduct(productId, payload);
      const updated = data?.product as ProductData | undefined;
      if (updated) {
        const updatedMedia: MediaItem[] = (updated.images || []).map(img => ({
          id: img.id,
          url: img.url,
          is_primary: img.is_primary,
          alt_text: img.alt_text,
          type: "image",
        }));
        setMedia(updatedMedia);
        setOriginalImageIds(new Set(updatedMedia.map(m => m.id as string | number)));
        setRemovedImageIds([]);
        if (updated.variants) {
           setProductVariants(updated.variants);
           setProductOptions(reconstructOptions(updated.variants));
        }
      }
      setSuccess("تم حفظ التغييرات بنجاح");
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message ?? "فشل حفظ التغييرات");
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع.")) return;
    setDeleting(true);
    try {
      if (!productId) {
        setError("معرف المنتج غير صالح.");
        setDeleting(false);
        return;
      }

      await sellerApi.deleteProduct(productId);
      router.push("/dashboard/products");
    } catch {
      setError("فشل حذف المنتج");
      setDeleting(false);
    }
  };

  if (!ready || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 text-sm">
        جاري التحميل...
      </div>
    );
  }

  if (!product) {
    return (
      <SellerShell title="المنتج غير موجود" icon={Package} hasStore>
        <div className="text-center py-20">
          <Package className="mx-auto mb-4 h-12 w-12 text-zinc-300" />
          <p className="text-zinc-500 mb-4">لم يتم العثور على هذا المنتج</p>
          <Link href="/dashboard/products" className="text-emerald-600 text-sm hover:underline">
            العودة للمنتجات
          </Link>
        </div>
      </SellerShell>
    );
  }

  const primaryImage = media.find((m) => m.is_primary && m.type === "image") ?? media.find(m => m.type === "image");

  return (
    <>
      <Head>
        <title>تعديل {product.name} — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell title={`تعديل: ${product.name}`} icon={Package} hasStore>
        <div className="mx-auto max-w-4xl space-y-6 pb-20">
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard/products"
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              العودة للمنتجات
            </Link>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={deleteProduct}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-800 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                {deleting ? "جاري الحذف..." : "حذف"}
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-xs text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-3 text-xs text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr,340px]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">معلومات المنتج</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">اسم المنتج</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">الوصف التسويقي للعميل</label>
                  <textarea
                    rows={6}
                    value={form.description}
                    placeholder="اكتب وصفًا واضحًا للمنتج، المزايا، الاستخدامات، وما يميز عرض متجرك."
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">صور وفيديوهات المنتج</h2>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{media.length} وسائط</span>
                </div>
                <ProductMediaUploader 
                  media={media} 
                  setMedia={setMedia} 
                  onRemoveExisting={handleRemoveExistingMedia} 
                />
              </div>

              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">خيارات المتغيرات</h2>
                </div>
                <ProductVariationsBuilder
                  basePrice={form.price}
                  options={productOptions}
                  setOptions={setProductOptions}
                  variants={productVariants}
                  setVariants={setProductVariants}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">التسعير</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">السعر (ر.س)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">سعر المقارنة (اختياري)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="السعر قبل الخصم"
                    value={form.compare_at_price}
                    onChange={(e) => setForm((f) => ({ ...f, compare_at_price: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {form.compare_at_price && Number(form.compare_at_price) > Number(form.price) && (
                    <p className="text-[10px] text-red-500">
                      خصم {Math.round(((Number(form.compare_at_price) - Number(form.price)) / Number(form.compare_at_price)) * 100)}%
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">الحالة والتصنيف</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">الحالة</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="active">نشط</option>
                    <option value="draft">مسودة</option>
                  </select>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">التصنيف</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">بدون تصنيف</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                    className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-600 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">منتج مميز</span>
                </label>
              </div>

              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4 shadow-sm">
                <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">الشحن والمخزون</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">الوزن (كجم)</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="مطلوب لحساب الشحن"
                    value={form.weight}
                    onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">SKU (رمز المنتج)</label>
                  <input
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                    placeholder="اختياري — رمز تتبع داخلي"
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {primaryImage && (
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 shadow-sm">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">معاينة البطاقة</h2>
                  <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800">
                      <img src={primaryImage.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-3 space-y-1">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                        {form.name || "اسم المنتج"}
                      </p>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {form.price ? `${Number(form.price).toLocaleString("ar-SA")} ر.س` : "— ر.س"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SellerShell>
    </>
  );
}
