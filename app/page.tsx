import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  Blocks,
  Box,
  Building2,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  FlaskConical,
  Headphones,
  PackageCheck,
  Search,
  Shirt,
  ShoppingBag,
  Store,
  Truck,
  Wrench,
} from "lucide-react";
import { StoreAdSlot } from "@/components/ads/StoreAdSlot";
import { StoreCard } from "@/components/explore/StoreCard";
import { HomeHeaderActions } from "@/components/home/HomeHeaderActions";
import {
  getExploreProducts,
  getExploreStores,
  getProducts,
  type StoreProductCard,
} from "@/lib/api-server";
import { proxiedProductImageSrc } from "@/lib/image-proxy";
import { productImageAlt, productImageUrl } from "@/lib/product-image";
import {
  SITE,
  buildTitle,
  canonicalUrl,
  itemListSchema,
  jsonLdString,
} from "@/lib/seo";
import { getStoreDisplayName } from "@/lib/store-display";

export const revalidate = 120;

export const metadata: Metadata = {
  title: buildTitle("منصة التجارة للمتاجر السعودية"),
  description: SITE.defaultDescription,
  alternates: { canonical: canonicalUrl("/") },
};

type FeaturedProduct = StoreProductCard & {
  storeSlug: string;
  storeName: string;
};

type HomeSearchParams = {
  q?: string;
  owner_type?: string;
};

const categories = [
  {
    name: "إلكترونيات",
    description: "أجهزة وتقنيات",
    icon: Headphones,
    href: "/?q=إلكترونيات",
  },
  {
    name: "عطور",
    description: "عطور ومنتجات عناية",
    icon: FlaskConical,
    href: "/?q=عطور",
  },
  {
    name: "أزياء",
    description: "أزياء وإكسسوارات",
    icon: Shirt,
    href: "/?q=أزياء",
  },
  {
    name: "خدمات",
    description: "خدمات متخصصة",
    icon: Wrench,
    href: "/?q=خدمات",
  },
  {
    name: "معارض",
    description: "معارض ومنشآت بيع",
    icon: Store,
    href: "/?owner_type=venue_owner",
  },
  {
    name: "إكسسوارات",
    description: "كماليات ومنتجات متنوعة",
    icon: ShoppingBag,
    href: "/?q=إكسسوارات",
  },
];

const merchantCapabilities = [
  {
    title: "رابط مستقل لمتجرك",
    description: "واجهة تحمل اسم متجرك وكتالوجك داخل منظومة داسم.",
    icon: Store,
  },
  {
    title: "كتالوج قابل للإدارة",
    description: "أضف المنتجات ونظّم الأقسام أو ابدأ من أدوات الاستيراد.",
    icon: Box,
  },
  {
    title: "تشغيل الطلبات",
    description: "إعدادات للدفع والشحن ومتابعة حالة الطلب من مكان واحد.",
    icon: Truck,
  },
  {
    title: "قراءة الأداء",
    description: "لوحة تعرض المنتجات والطلبات والمبيعات المسجلة لمتجرك.",
    icon: BarChart3,
  },
];

const passportSteps = [
  { label: "هوية المتجر", icon: BadgeCheck },
  { label: "الكتالوج", icon: PackageCheck },
  { label: "إعداد الدفع", icon: CircleDollarSign },
  { label: "الشحن", icon: Truck },
  { label: "الوصول للعميل", icon: Compass },
];

function ownerLabel(type: string) {
  return (
    (
      {
        venue_owner: "معرض",
        dealer: "تاجر",
        user: "متجر",
      } as Record<string, string>
    )[type] || "متجر"
  );
}

function productIdentity(product: FeaturedProduct) {
  return product.id ? String(product.id) : product.slug || product.name;
}

async function getFeaturedProducts(
  storeItems: Awaited<ReturnType<typeof getExploreStores>>["data"],
) {
  const results = await Promise.all(
    storeItems
      .filter((store) => (store.products_count ?? 0) > 0)
      .slice(0, 12)
      .map(async (store) => {
        const products = await getProducts(store.slug, {
          sort: "featured",
          per_page: "4",
        });

        return products.data.slice(0, 4).map((product) => ({
          ...product,
          storeSlug: store.slug,
          storeName: getStoreDisplayName(store),
        }));
      }),
  );

  return results.flat().slice(0, 12);
}

async function getHomeProducts(
  q?: string,
  ownerType?: string,
): Promise<FeaturedProduct[]> {
  const exploredProducts = await getExploreProducts({
    q,
    owner_type: ownerType,
    sort: q || ownerType ? "newest" : "featured",
    per_page: 12,
  });

  return exploredProducts.data
    .filter((product) => product.store?.slug)
    .map((product) => ({
      ...product,
      storeSlug: product.store.slug,
      storeName: getStoreDisplayName(product.store),
    }));
}

function ProductTile({ product }: { product: FeaturedProduct }) {
  const price = Number(product.price);
  const imageUrl = productImageUrl(product);
  const imageSrc = proxiedProductImageSrc(imageUrl);
  const productHref = `/${product.storeSlug}/products/${product.id}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
      <Link href={productHref} className="block">
        <div className="relative aspect-[1.18] bg-slate-50 dark:bg-zinc-900/50">
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt={productImageAlt(product)}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-zinc-400">
              بدون صورة
            </div>
          )}
          {product.is_featured ? (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
              مميز
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-2 p-4">
        <Link href={productHref}>
          <h3 className="line-clamp-1 text-sm font-extrabold text-slate-950 hover:text-emerald-700 dark:text-zinc-100">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-1 text-xs text-slate-500 dark:text-zinc-400">
          {product.storeName}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-extrabold text-slate-950 dark:text-zinc-100">
            {Number.isFinite(price) ? price.toFixed(0) : product.price} ر.س
          </span>
          <Link
            href={productHref}
            className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-300"
            aria-label={`عرض ${product.name}`}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function EmptyProductsState({ q }: { q?: string }) {
  const message = q
    ? "لا توجد منتجات مطابقة لهذا البحث حاليًا. جرّب كلمة مختلفة أو استعرض المتاجر المتاحة."
    : "لا توجد منتجات منشورة حاليًا.";

  return (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
        <ShoppingBag className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-extrabold text-slate-950 dark:text-zinc-100">
        لم نعثر على منتجات
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-zinc-400">
        {message}
      </p>
      <Link
        href="#stores"
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 dark:bg-zinc-700"
      >
        عرض المتاجر
        <ArrowLeft className="h-4 w-4" />
      </Link>
    </div>
  );
}

function CommercePassport({ storeCount }: { storeCount: number }) {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label="جواز نمو المتجر">
      <div className="absolute -inset-4 rounded-[2rem] bg-[radial-gradient(circle_at_85%_15%,rgba(14,124,102,.34),transparent_45%),radial-gradient(circle_at_15%_90%,rgba(199,134,56,.22),transparent_42%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#0d2636]/95 p-5 shadow-2xl shadow-black/30 sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[#d4a45f]">
              DASM COMMERCE PASSPORT
            </p>
            <h2 className="mt-2 text-xl font-extrabold text-white">
              مسار متجر قابل للنمو
            </h2>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-300/10 text-emerald-200">
            <Building2 className="h-6 w-6" />
          </span>
        </div>

        <ol className="mt-5 grid gap-3">
          {passportSteps.map((step, index) => {
            const Icon = step.icon;

            return (
              <li
                key={step.label}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3"
              >
                <span className="font-mono text-xs text-[#d4a45f]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="h-4 w-4 text-emerald-300" />
                <span className="text-sm font-bold text-slate-100">
                  {step.label}
                </span>
                {index < passportSteps.length - 1 ? (
                  <span className="mr-auto h-px w-8 bg-gradient-to-l from-emerald-400/60 to-transparent" />
                ) : (
                  <CheckCircle2 className="mr-auto h-4 w-4 text-emerald-300" />
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-[#f4f0e8] px-4 py-3 text-[#081c2c]">
          <span className="text-xs font-bold">متاجر عامة متاحة الآن</span>
          <span className="font-mono text-2xl font-bold">
            {new Intl.NumberFormat("ar-SA").format(storeCount)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const ownerType =
    sp.owner_type?.trim() === "venue_owner" ? "venue_owner" : undefined;

  const [paginator, products] = await Promise.all([
    getExploreStores({ q, owner_type: ownerType, per_page: 24 }),
    getHomeProducts(q, ownerType),
  ]);

  const stores = paginator.data;
  const fallbackProducts =
    products.length >= 12 ? [] : await getFeaturedProducts(stores);
  const productKeys = new Set(
    products.map(
      (product) => `${product.storeSlug}-${productIdentity(product)}`,
    ),
  );
  const visibleProducts = [
    ...products,
    ...fallbackProducts.filter(
      (product) =>
        !productKeys.has(
          `${product.storeSlug}-${productIdentity(product)}`,
        ),
    ),
  ].slice(0, 12);
  const activeStores = stores
    .filter((store) => (store.products_count ?? 0) > 0)
    .slice(0, 5);
  const shoppingHref = "#stores";
  const listLd = itemListSchema(
    "متاجر داسم",
    stores.map((store) => ({
      name: getStoreDisplayName(store),
      url: `/${store.slug}`,
      image: store.logo_url ?? undefined,
    })),
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString(listLd) }}
      />
      <div className="min-h-screen bg-[#f7f8f8] text-slate-950 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4">
            <Link
              href="/"
              className="flex items-center gap-3 text-xl font-extrabold text-[#081c2c] sm:text-2xl dark:text-zinc-100"
            >
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0e7c66] text-white shadow-sm shadow-emerald-950/20">
                <ShoppingBag className="h-6 w-6" />
              </span>
              <span>متاجر داسم</span>
            </Link>

            <nav
              aria-label="التنقل الرئيسي"
              className="hidden items-center gap-7 text-sm font-bold text-slate-700 lg:flex dark:text-zinc-200"
            >
              <Link href="/" className="text-[#0e7c66]">
                الرئيسية
              </Link>
              <Link href="#stores" className="hover:text-[#0e7c66]">
                استكشف المتاجر
              </Link>
              <Link href="#for-merchants" className="hover:text-[#0e7c66]">
                لأصحاب المتاجر
              </Link>
              <Link href="#categories" className="hover:text-[#0e7c66]">
                الأقسام
              </Link>
            </nav>

            <HomeHeaderActions shoppingHref={shoppingHref} />
          </div>

          <nav
            aria-label="التنقل على الهاتف"
            className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 text-xs font-bold lg:hidden dark:border-zinc-800"
          >
            <Link
              href="#stores"
              className="whitespace-nowrap rounded-full bg-emerald-50 px-3 py-2 text-[#0e7c66] dark:bg-emerald-500/10 dark:text-emerald-300"
            >
              المتاجر
            </Link>
            <Link
              href="#products"
              className="whitespace-nowrap rounded-full px-3 py-2 text-slate-600 dark:text-zinc-300"
            >
              المنتجات
            </Link>
            <Link
              href="#for-merchants"
              className="whitespace-nowrap rounded-full px-3 py-2 text-slate-600 dark:text-zinc-300"
            >
              لأصحاب المتاجر
            </Link>
            <Link
              href="/auth/signup"
              className="whitespace-nowrap rounded-full bg-[#081c2c] px-3 py-2 text-white dark:bg-zinc-700"
            >
              أنشئ متجرك
            </Link>
          </nav>
        </header>

        <main>
          <section
            data-testid="platform-hero"
            className="relative overflow-hidden bg-[#081c2c] px-4 py-14 text-white sm:py-18 lg:py-22"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(60,130,246,.18),transparent_34%),radial-gradient(circle_at_80%_70%,rgba(14,124,102,.26),transparent_38%)]" />
            <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-4 py-2 text-xs font-bold text-emerald-100">
                  <Compass className="h-4 w-4" />
                  منصة تجارة عربية من منظومة داسم
                </div>
                <h1 className="mt-6 text-4xl font-extrabold leading-[1.2] tracking-tight sm:text-5xl lg:text-6xl">
                  من متجر سعودي مستقل،
                  <span className="block text-[#d4a45f]">إلى سوق أكبر.</span>
                </h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                  تجمع متاجر داسم هوية المتجر والكتالوج وإعدادات الدفع
                  والشحن والتتبع في تجربة عربية واحدة، وتبني التوسع سوقًا
                  بعد سوق.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#0e7c66] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-600"
                  >
                    أنشئ متجرك
                    <ArrowLeft className="h-4 w-4" />
                  </Link>
                  <Link
                    href="#stores"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/10"
                  >
                    استكشف السوق
                  </Link>
                </div>

                <Link
                  href="https://www.dasm.com.sa/why-dasm"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-300 transition hover:text-white"
                >
                  للشراكات والاستثمار: تعرّف على منظومة داسم
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>

              <CommercePassport storeCount={paginator.total} />
            </div>
          </section>

          <section className="border-b border-slate-200 bg-[#f4f0e8] px-4 py-5 dark:border-zinc-800 dark:bg-zinc-900">
            <form
              action="/"
              className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 dark:border-zinc-700 dark:bg-zinc-950 dark:focus-within:ring-emerald-900/30"
            >
              <Search className="mr-2 h-5 w-5 shrink-0 text-slate-400" />
              <label htmlFor="marketplace-search" className="sr-only">
                ابحث عن منتج أو متجر
              </label>
              <input
                id="marketplace-search"
                name="q"
                defaultValue={q}
                placeholder="ابحث عن منتج أو متجر..."
                className="min-w-0 flex-1 bg-transparent px-1 py-3 text-sm text-slate-950 outline-none dark:text-zinc-100"
              />
              <button className="rounded-xl bg-[#081c2c] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0e7c66] dark:bg-zinc-700">
                بحث
              </button>
            </form>
            {ownerType ? (
              <div className="mx-auto mt-3 flex max-w-3xl items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
                <span>عرض المعارض فقط</span>
                <Link href="/" className="underline underline-offset-4">
                  إزالة الفلتر
                </Link>
              </div>
            ) : null}
          </section>

          <section
            id="for-merchants"
            className="mx-auto max-w-7xl scroll-mt-32 px-4 py-14"
          >
            <div className="grid gap-10 lg:grid-cols-[.72fr_1.28fr] lg:items-end">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#0e7c66]">
                  لأصحاب المتاجر
                </p>
                <h2 className="mt-3 text-3xl font-extrabold leading-tight text-[#081c2c] dark:text-zinc-100">
                  أدوات التشغيل في قصة واحدة مفهومة.
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-zinc-400">
                  ابدأ بمتجرك ومنتجاتك، ثم فعّل ما تحتاجه من أدوات التشغيل
                  المتاحة دون أن تفقد هويتك أو علاقتك بعملائك.
                </p>
                <Link
                  href="/auth/signup"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#0e7c66]"
                >
                  ابدأ إنشاء متجرك
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {merchantCapabilities.map((capability) => {
                  const Icon = capability.icon;

                  return (
                    <article
                      key={capability.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-[#0e7c66] dark:bg-emerald-500/10 dark:text-emerald-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <h3 className="mt-4 text-base font-extrabold">
                        {capability.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-zinc-400">
                        {capability.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>

          <section
            className="mx-auto max-w-7xl scroll-mt-32 px-4 pb-12"
            id="products"
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#0e7c66]">
                  من الكتالوج المنشور
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  منتجات من متاجر داسم
                </h2>
              </div>
              <Link
                href="#stores"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0e7c66]"
              >
                عرض المتاجر
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {visibleProducts.length ? (
                visibleProducts.map((product, index) => (
                  <ProductTile
                    key={`${product.storeSlug}-${productIdentity(product)}-${index}`}
                    product={product}
                  />
                ))
              ) : (
                <EmptyProductsState q={q} />
              )}
            </div>

            {!q && !ownerType ? (
              <StoreAdSlot
                slotKey="store.home.banner"
                variant="card"
                className="mt-6"
              />
            ) : null}
          </section>

          <section
            className="mx-auto max-w-7xl scroll-mt-32 px-4 pb-12"
            id="stores"
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#0e7c66]">
                  متاجر لديها منتجات منشورة
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  متاجر نشطة للاستكشاف
                </h2>
              </div>
              <Link
                href="#all-stores"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0e7c66]"
              >
                عرض الكل
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            {activeStores.length ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
                {activeStores.map((store) => (
                  <Link
                    key={store.id}
                    href={`/${store.slug}`}
                    className="group flex min-h-32 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">
                        {getStoreDisplayName(store)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        {ownerLabel(store.owner_type)} ·{" "}
                        {store.products_count ?? 0} منتج
                      </p>
                      <span className="mt-4 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-[#0e7c66] dark:bg-emerald-500/10 dark:text-emerald-300">
                        زيارة المتجر
                      </span>
                    </div>
                    <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-zinc-700 dark:bg-zinc-950">
                      {store.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={store.logo_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-7 w-7 text-[#0e7c66] dark:text-emerald-300" />
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                لا توجد متاجر بمنتجات منشورة ضمن هذا البحث حاليًا.
              </div>
            )}
          </section>

          <section
            className="mx-auto max-w-7xl scroll-mt-32 px-4 pb-12"
            id="categories"
          >
            <h2 className="mb-5 flex items-center gap-2 text-2xl font-extrabold">
              <Blocks className="h-5 w-5 text-[#0e7c66]" />
              تصفح حسب المجال
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {categories.map((category) => {
                const Icon = category.icon;

                return (
                  <Link
                    key={category.name}
                    href={category.href}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <p className="text-sm font-extrabold">{category.name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                        {category.description}
                      </p>
                    </div>
                    <Icon className="h-7 w-7 text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </section>

          <section
            className="mx-auto max-w-7xl scroll-mt-32 px-4 pb-16"
            id="all-stores"
          >
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#0e7c66]">
                  الدليل العام
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">كل المتاجر</h2>
              </div>
              <p className="font-mono text-sm text-slate-500 dark:text-zinc-400">
                {new Intl.NumberFormat("ar-SA").format(paginator.total)} متجر
              </p>
            </div>

            {stores.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {stores.map((store) => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center text-sm text-slate-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
                لا توجد متاجر مطابقة حاليًا.
              </div>
            )}
          </section>
        </main>

        <footer
          id="contact"
          className="border-t border-slate-200 bg-[#081c2c] text-white dark:border-zinc-800"
        >
          <div className="mx-auto grid max-w-7xl gap-9 px-4 py-12 md:grid-cols-[1.25fr_.75fr_.75fr]">
            <div>
              <div className="flex items-center gap-3 text-2xl font-extrabold">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#0e7c66]">
                  <ShoppingBag className="h-5 w-5" />
                </span>
                <span>متاجر داسم</span>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
                منصة عربية لاكتشاف المتاجر وتشغيل واجهاتها الرقمية داخل
                منظومة داسم، تبدأ من السوق السعودي وتبني التوسع على قدرات
                تشغيلية قابلة للتحقق.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#d4a45f]">
                ابدأ من هنا
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <Link href="#stores" className="hover:text-white">
                  استكشف المتاجر
                </Link>
                <Link href="/auth/signup" className="hover:text-white">
                  أنشئ متجرك
                </Link>
                <Link href="/auth/login" className="hover:text-white">
                  تسجيل الدخول
                </Link>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-[#d4a45f]">
                منظومة داسم
              </h3>
              <div className="mt-4 grid gap-3 text-sm text-slate-300">
                <Link
                  href="https://www.dasm.com.sa/why-dasm"
                  className="hover:text-white"
                >
                  للشراكات والاستثمار
                </Link>
                <Link
                  href="https://ads.dasm.com.sa/advertise"
                  className="hover:text-white"
                >
                  طلب إعلان
                </Link>
                <Link
                  href="https://www.dasm.com.sa"
                  className="hover:text-white"
                >
                  منصة داسم الرئيسية
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
