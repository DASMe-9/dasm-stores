import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";
import {
  ArrowRight, ShoppingCart, Star, Tag, Minus, Plus, Check,
} from "lucide-react";
import Link from "next/link";

interface ProductImage {
  id: number;
  url: string;
  alt_text: string;
}

interface ProductVariant {
  id: number;
  name: string;
  price: number | null;
  is_active: boolean;
}

interface ProductData {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  is_featured: boolean;
  weight: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  category: { id: number; name: string; slug: string } | null;
  tab: { id: number; name: string; slug: string } | null;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const { slug, id } = router.query;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!slug || !id) return;
    loadProduct();
  }, [slug, id]);

  const loadProduct = async () => {
    try {
      const { data } = await publicApi.getProduct(slug as string, Number(id));
      setProduct(data.product);
      if (data.product.variants?.length > 0) {
        setSelectedVariant(data.product.variants[0].id);
      }
    } catch {
      /* 404 */
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    if (!product) return;
    const cartKey = `cart_${slug}`;
    const saved = localStorage.getItem(cartKey);
    const cart: { productId: number; variantId?: number; qty: number }[] = saved ? JSON.parse(saved) : [];

    const existing = cart.find(
      (c) => c.productId === product.id && (c.variantId ?? null) === (selectedVariant ?? null)
    );
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ productId: product.id, variantId: selectedVariant ?? undefined, qty });
    }

    localStorage.setItem(cartKey, JSON.stringify(cart));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const activeVariant = product?.variants?.find((v) => v.id === selectedVariant);
  const displayPrice = activeVariant?.price ?? product?.price ?? 0;
  const hasDiscount = product?.compare_at_price && product.compare_at_price > displayPrice;
  const discountPct = hasDiscount
    ? Math.round(((product!.compare_at_price! - displayPrice) / product!.compare_at_price!) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400 text-sm">
        جاري التحميل...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 rtl">
        <div className="text-center space-y-3">
          <Tag className="w-16 h-16 text-gray-200 mx-auto" />
          <h1 className="text-xl font-bold text-gray-600">المنتج غير موجود</h1>
          <Link href={`/${slug}`} className="text-emerald-600 text-sm hover:underline">
            العودة للمتجر
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [];

  return (
    <>
      <Head>
        <title>{product.name} — متاجر داسم</title>
        <meta name="description" content={product.description?.slice(0, 160) || ""} />
      </Head>

      <div className="min-h-screen bg-gray-50 rtl">
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Link href={`/${slug}`} className="p-2 rounded-xl hover:bg-gray-100 transition">
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-sm font-bold text-gray-900 truncate">{product.name}</h1>
          <Link
            href={`/${slug}/cart`}
            className="mr-auto p-2 rounded-xl hover:bg-gray-100 transition relative"
          >
            <ShoppingCart className="w-5 h-5 text-gray-600" />
          </Link>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* الصور */}
            <div className="space-y-3">
              <div className="aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage].url}
                    alt={images[selectedImage].alt_text || product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Tag className="w-20 h-20 text-gray-200" />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                        i === selectedImage ? "border-emerald-500" : "border-gray-200"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* التفاصيل */}
            <div className="space-y-5">
              <div>
                {product.category && (
                  <span className="text-xs text-emerald-600 font-medium">{product.category.name}</span>
                )}
                <h2 className="text-xl font-bold text-gray-900 mt-1">{product.name}</h2>
                {product.is_featured && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    <Star className="w-3 h-3" /> مميز
                  </span>
                )}
              </div>

              {/* السعر */}
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-emerald-600">
                  {Number(displayPrice).toFixed(0)} ر.س
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base text-gray-400 line-through">
                      {Number(product.compare_at_price).toFixed(0)} ر.س
                    </span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-full">
                      -{discountPct}%
                    </span>
                  </>
                )}
              </div>

              {/* المتغيرات */}
              {product.variants.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">الخيارات</label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                          selectedVariant === v.id
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {v.name}
                        {v.price && v.price !== product.price && (
                          <span className="mr-1 text-xs text-gray-400">{Number(v.price).toFixed(0)} ر.س</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* الكمية */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">الكمية</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-base font-bold w-8 text-center">{qty}</span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* زر الإضافة */}
              <button
                onClick={addToCart}
                className={`w-full py-3 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm ${
                  added
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" /> تمت الإضافة للسلة
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> أضف للسلة — {(Number(displayPrice) * qty).toFixed(0)} ر.س
                  </>
                )}
              </button>

              {/* الوصف */}
              {product.description && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">الوصف</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {product.sku && (
                <p className="text-xs text-gray-400">SKU: {product.sku}</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
