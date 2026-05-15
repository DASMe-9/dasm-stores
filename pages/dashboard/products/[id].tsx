import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  GripVertical,
  ImagePlus,
  Package,
  Save,
  Star,
  Trash2,
  Upload,
  X as XIcon,
} from "lucide-react";
import { SellerShell } from "@/components/seller/SellerShell";
import { sellerApi, uploadApi } from "@/lib/api";

interface ProductImage {
  id: number;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  weight: number | null;
  status: string;
  is_featured: boolean;
  tab_id: number | null;
  category_id: number | null;
  images: ProductImage[];
  tab: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
}

export default function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [ready, setReady] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [tabs, setTabs] = useState<{ id: number; name: string }[]>([]);
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
    tab_id: "",
    category_id: "",
    status: "active" as string,
    is_featured: false,
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [originalImageIds, setOriginalImageIds] = useState<Set<number>>(new Set());
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = localStorage.getItem("stores_token");
    if (!t) {
      router.replace("/auth/login?returnUrl=/dashboard/products");
      return;
    }
    setReady(true);
  }, [router]);

  useEffect(() => {
    if (!ready || !id) return;
    loadProduct();
  }, [ready, id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const [prodRes, tabsRes, catsRes] = await Promise.allSettled([
        sellerApi.getProduct(Number(id)),
        sellerApi.getTabs(),
        sellerApi.getCategories(),
      ]);

      if (prodRes.status === "fulfilled") {
        const p = prodRes.value.data.product as ProductData;
        setProduct(p);
        setImages(p.images || []);
        setOriginalImageIds(new Set((p.images || []).map((img: ProductImage) => img.id)));
        setRemovedImageIds([]);
        setForm({
          name: p.name,
          description: p.description || "",
          sku: p.sku || "",
          price: String(p.price),
          compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
          weight: p.weight ? String(p.weight) : "",
          tab_id: p.tab_id ? String(p.tab_id) : "",
          category_id: p.category_id ? String(p.category_id) : "",
          status: p.status,
          is_featured: p.is_featured,
        });
      }

      if (tabsRes.status === "fulfilled") {
        const raw = (tabsRes.value.data as { tabs?: { id: number; name: string }[] })?.tabs ?? [];
        setTabs(raw.map((x) => ({ id: x.id, name: x.name })));
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
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        if (file.size > 8 * 1024 * 1024) {
          setError("حجم الصورة يجب أن يكون أقل من 8 ميقابايت");
          continue;
        }
        const { data } = await uploadApi.uploadMedia(file, "store_product_image");
        setImages((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: data.secure_url,
            alt_text: null,
            is_primary: prev.length === 0,
            sort_order: prev.length,
          },
        ]);
      }
    } catch {
      setError("فشل رفع الصورة — تأكد من اتصال الإنترنت");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const setPrimaryImage = (idx: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({ ...img, is_primary: i === idx })),
    );
  };

  const removeImage = (idx: number) => {
    setImages((prev) => {
      const removed = prev[idx];
      if (removed && originalImageIds.has(removed.id)) {
        setRemovedImageIds((ids) => [...ids, removed.id]);
      }
      const next = prev.filter((_, i) => i !== idx);
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
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

      const newImages = images
        .filter((img) => !originalImageIds.has(img.id))
        .map((img) => ({ url: img.url, alt_text: img.alt_text, is_primary: img.is_primary }));

      const primaryImg = images.find((img) => img.is_primary);
      const primaryImageId = primaryImg && originalImageIds.has(primaryImg.id) ? primaryImg.id : null;

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        sku: form.sku.trim() || null,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        weight: form.weight ? Number(form.weight) : null,
        status: form.status,
        is_featured: form.is_featured,
        tab_id: form.tab_id ? parseInt(form.tab_id, 10) : null,
        category_id: form.category_id ? parseInt(form.category_id, 10) : null,
      };

      if (removedImageIds.length > 0) payload.remove_image_ids = removedImageIds;
      if (newImages.length > 0) payload.images = newImages;
      if (primaryImageId) payload.primary_image_id = primaryImageId;

      const { data } = await sellerApi.updateProduct(Number(id), payload);
      const updated = data?.product as ProductData | undefined;
      if (updated) {
        setImages(updated.images || []);
        setOriginalImageIds(new Set((updated.images || []).map((img: ProductImage) => img.id)));
        setRemovedImageIds([]);
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
      await sellerApi.deleteProduct(Number(id));
      router.push("/dashboard");
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
          <Link href="/dashboard" className="text-emerald-600 text-sm hover:underline">
            العودة للوحة التحكم
          </Link>
        </div>
      </SellerShell>
    );
  }

  const primaryImage = images.find((img) => img.is_primary) ?? images[0];

  return (
    <>
      <Head>
        <title>تعديل {product.name} — متاجر داسم</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <SellerShell title={`تعديل: ${product.name}`} icon={Package} hasStore>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* الهيدر */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              <ArrowRight className="h-3.5 w-3.5" />
              العودة للوحة التحكم
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
            {/* العمود الأيسر — المعلومات الأساسية */}
            <div className="space-y-6">
              {/* معلومات المنتج */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
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
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">الوصف</label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* معرض الصور */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">صور المنتج</h2>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{images.length} صورة</span>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition ${
                          img.is_primary
                            ? "border-emerald-500 shadow-md shadow-emerald-500/20"
                            : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                        }`}
                      >
                        <img src={img.url} alt={img.alt_text || ""} className="h-full w-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute top-1 right-1 flex items-center gap-0.5 bg-emerald-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                            <Star className="h-2.5 w-2.5" />
                            رئيسية
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {!img.is_primary && (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(idx)}
                              className="rounded-lg bg-white/90 p-1.5 text-emerald-600 hover:bg-white transition"
                              title="تعيين كصورة رئيسية"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="rounded-lg bg-white/90 p-1.5 text-red-600 hover:bg-white transition"
                            title="حذف الصورة"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 py-6 text-zinc-400 dark:text-zinc-500 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400 transition disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="h-8 w-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs">جاري الرفع...</span>
                    </>
                  ) : (
                    <>
                      <ImagePlus className="h-8 w-8" />
                      <span className="text-xs">اضغط لإضافة صور — يمكنك اختيار عدة صور</span>
                      <span className="text-[10px]">JPG, PNG, WebP — حتى 8 ميقابايت للصورة</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* العمود الأيمن — الإعدادات */}
            <div className="space-y-6">
              {/* التسعير */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
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

              {/* الحالة والتصنيف */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
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

                {tabs.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">التبويب</label>
                    <select
                      value={form.tab_id}
                      onChange={(e) => setForm((f) => ({ ...f, tab_id: e.target.value }))}
                      className="w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100"
                    >
                      <option value="">بدون تبويب</option>
                      {tabs.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

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

              {/* الشحن */}
              <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-4">
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

              {/* معاينة سريعة */}
              {primaryImage && (
                <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3">
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
