import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft, BadgeCheck, Blocks, FlaskConical, Gavel, Headphones,
  Megaphone, PackageCheck, Search, Shirt, ShoppingBag, ShoppingCart, Sparkles,
  Store, Target, User, Wrench,
} from "lucide-react";
import { StoreCard } from "@/components/explore/StoreCard";
import { getExploreStores, getProducts, type StoreProductCard } from "@/lib/api-server";
import { SITE, buildTitle, canonicalUrl, itemListSchema, jsonLdString } from "@/lib/seo";

export const revalidate = 120;

export const metadata: Metadata = {
  title: buildTitle("استكشف المتاجر"),
  description: SITE.defaultDescription,
  alternates: { canonical: canonicalUrl("/") },
};

type FeaturedProduct = StoreProductCard & { storeSlug: string; storeName: string };

const categories = [
  { name: "إلكترونيات", description: "أحدث الأجهزة والتقنيات", icon: Headphones, href: "/?q=إلكترونيات" },
  { name: "عطور", description: "عطور أصلية فاخرة", icon: FlaskConical, href: "/?q=عطور" },
  { name: "أزياء", description: "ملابس رجالية ونسائية", icon: Shirt, href: "/?q=أزياء" },
  { name: "خدمات", description: "خدمات متنوعة", icon: Wrench, href: "/?q=خدمات" },
  { name: "معارض", description: "معارض ومبيعات", icon: Store, href: "/?owner_type=venue_owner" },
  { name: "مزادات", description: "مزادات علنية مباشرة", icon: Gavel, href: "https://dasm.com.sa/auctions" },
];

function ownerLabel(type: string) {
  return ({ venue_owner: "معرض", dealer: "تاجر", user: "متجر" } as Record<string, string>)[type] || "متجر";
}

async function getFeaturedProducts(storeItems: Awaited<ReturnType<typeof getExploreStores>>["data"]) {
  const results = await Promise.all(
    storeItems.slice(0, 5).map(async (store) => {
      const products = await getProducts(store.slug, { sort: "featured", per_page: "2" });
      return products.data.slice(0, 2).map((product) => ({ ...product, storeSlug: store.slug, storeName: store.name }));
    }),
  );
  return results.flat().slice(0, 5);
}

function HeroScene() {
  return (
    <div className="home-hero-commerce-scene" aria-hidden>
      <div className="home-hero-light home-hero-light-a" />
      <div className="home-hero-light home-hero-light-b" />
      <div className="home-hero-product home-hero-product-bag"><ShoppingBag className="h-14 w-14" /></div>
      <div className="home-hero-product home-hero-product-watch"><BadgeCheck className="h-12 w-12" /></div>
      <div className="home-hero-product home-hero-product-audio"><Headphones className="h-14 w-14" /></div>
      <div className="home-hero-product home-hero-product-perfume"><FlaskConical className="h-12 w-12" /></div>
      <div className="home-hero-cart"><ShoppingCart className="h-16 w-16" /></div>
      <span className="home-hero-spark home-hero-spark-a" />
      <span className="home-hero-spark home-hero-spark-b" />
      <span className="home-hero-spark home-hero-spark-c" />
    </div>
  );
}

function ProductTile({ product }: { product: FeaturedProduct }) {
  const price = Number(product.price);
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/store/${product.storeSlug}/products/${product.id}`} className="block">
        <div className="relative aspect-[1.18] bg-slate-50">
          {product.primary_image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.primary_image.url} alt={product.primary_image.alt_text || product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : <div className="flex h-full items-center justify-center text-sm text-slate-400">بدون صورة</div>}
          {product.is_featured ? (
            <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">مميز</span>
          ) : null}
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <Link href={`/store/${product.storeSlug}/products/${product.id}`}><h3 className="line-clamp-1 text-sm font-extrabold text-slate-950 hover:text-emerald-700">{product.name}</h3></Link>
        <p className="line-clamp-1 text-xs text-slate-500">{product.storeName}</p>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-extrabold text-slate-950">{price.toFixed(0)} ر.س</span>
          <Link href={`/store/${product.storeSlug}/cart`} className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition hover:bg-emerald-600 hover:text-white" aria-label={`فتح سلة ${product.storeName}`}>
            <ShoppingCart className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function SponsoredPlaceholder({ index }: { index: number }) {
  const names = ["حذاء رياضي رجالي", "نظارة شمسية كلاسيك", "ساعة ذكية", "عطر فاخر", "سماعات لاسلكية"];
  return (
    <Link href="https://ads.dasm.com.sa/advertise" className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[1.18] bg-[radial-gradient(circle_at_50%_35%,rgba(20,184,166,.2),transparent_34%),linear-gradient(145deg,#f8fafc,#e2e8f0)]">
        <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">ممول</span>
        <div className="grid h-full place-items-center text-emerald-700"><ShoppingBag className="h-14 w-14" /></div>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-sm font-extrabold text-slate-950">{names[index % names.length]}</h3>
        <p className="line-clamp-1 text-xs text-slate-500">مساحة منتج ممول</p>
        <div className="flex items-center justify-between gap-3"><span className="text-sm font-extrabold text-slate-950">أعلن الآن</span><span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white"><Megaphone className="h-4 w-4" /></span></div>
      </div>
    </Link>
  );
}

export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim();
  const paginator = await getExploreStores({ q, per_page: 24 });
  const stores = paginator.data;
  const products = await getFeaturedProducts(stores);
  const featuredStores = stores.slice(0, 5);
  const shoppingHref = "#stores";
  const listLd = itemListSchema("متاجر داسم", stores.map((s) => ({ name: s.name, url: `/store/${s.slug}`, image: s.logo_url ?? undefined })));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(listLd) }} />
      <div className="min-h-screen bg-[#f8fafc] text-slate-950">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4">
            <Link href="/" className="flex items-center gap-3 text-2xl font-extrabold text-slate-950"><span>متاجر داسم</span><span className="grid h-11 w-11 place-items-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700"><ShoppingBag className="h-6 w-6" /></span></Link>
            <nav className="hidden items-center gap-8 text-sm font-bold text-slate-800 lg:flex"><Link href="/" className="border-b-2 border-emerald-600 pb-1 text-emerald-700">الرئيسية</Link><Link href="#stores" className="hover:text-emerald-700">استكشف المتاجر</Link><Link href="#categories" className="hover:text-emerald-700">الأقسام</Link><Link href="#track-order" className="hover:text-emerald-700">تتبع الطلب</Link><Link href="#contact" className="hover:text-emerald-700">تواصل معنا</Link></nav>
            <div className="flex items-center gap-2"><Link href="/auth/login" className="hidden items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700 sm:inline-flex"><User className="h-4 w-4" /> تسجيل الدخول</Link><Link href={shoppingHref} className="relative inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:border-emerald-200 hover:text-emerald-700"><ShoppingCart className="h-4 w-4" /> ابدأ التسوق</Link></div>
          </div>
        </header>
        <main>
          <section className="px-4 pt-5"><div className="relative mx-auto min-h-[330px] max-w-7xl overflow-hidden rounded-3xl bg-[#021b1f] px-5 py-10 text-white shadow-2xl shadow-emerald-950/20 md:px-12 md:py-14"><HeroScene /><Link href="https://ads.dasm.com.sa/advertise" className="absolute left-6 top-6 z-10 hidden items-center gap-2 rounded-2xl border border-white/20 bg-black/20 px-4 py-2 text-xs font-bold text-emerald-50 backdrop-blur transition hover:bg-white/10 md:inline-flex"><Sparkles className="h-4 w-4" /> مساحة إعلان رئيسية</Link><div className="relative z-10 mx-auto max-w-3xl text-center"><h1 className="text-4xl font-extrabold leading-tight md:text-6xl">اكتشف متاجر ومنتجات داسم</h1><p className="mt-4 text-lg text-emerald-50/80 md:text-xl">كل المتاجر والمنتجات في واجهة واحدة</p><form action="/" className="mx-auto mt-7 flex max-w-2xl items-center gap-3 rounded-full bg-white p-2 shadow-xl"><Search className="mr-4 h-5 w-5 text-slate-500" /><input name="q" defaultValue={q} placeholder="ابحث عن منتج أو متجر..." className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-slate-950 outline-none" /><button className="rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">بحث</button></form></div></div></section>
          <section className="mx-auto max-w-7xl px-4 py-8" id="products"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-extrabold"><Sparkles className="h-5 w-5 text-emerald-600" /> منتجات مختارة</h2><Link href="#stores" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">عرض المتاجر <ArrowLeft className="h-4 w-4" /></Link></div><div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]"><div className="grid grid-cols-2 gap-4 lg:grid-cols-5">{products.length ? products.map((product) => <ProductTile key={`${product.storeSlug}-${product.id}`} product={product} />) : stores.length ? stores.slice(0, 5).map((store) => <StoreCard key={store.id} store={store} />) : Array.from({ length: 5 }).map((_, index) => <SponsoredPlaceholder key={index} index={index} />)}</div><Link href="https://ads.dasm.com.sa/advertise" className="group relative min-h-48 overflow-hidden rounded-2xl bg-[#031b1e] p-6 text-white shadow-lg"><div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_30%,rgba(45,212,191,.36),transparent_28%),radial-gradient(circle_at_80%_75%,rgba(20,184,166,.28),transparent_30%)]" /><div className="relative z-10 flex h-full flex-col justify-between"><div><p className="text-sm text-emerald-100">مساحة إعلان</p><h3 className="mt-2 text-2xl font-extrabold">مميزة</h3></div><span className="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-emerald-400">أعلن الآن <Megaphone className="h-4 w-4" /></span></div></Link></div></section>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <section className="mx-auto max-w-7xl px-4 pb-8" id="stores"><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-extrabold"><BadgeCheck className="h-5 w-5 text-emerald-600" /> متاجر مميزة</h2><Link href="#all-stores" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700">عرض الكل <ArrowLeft className="h-4 w-4" /></Link></div><div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">{featuredStores.length ? featuredStores.map((store) => <Link key={store.id} href={`/store/${store.slug}`} className="group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"><div className="min-w-0"><p className="truncate text-sm font-extrabold">{store.name}</p><p className="mt-1 text-xs text-slate-500">{ownerLabel(store.owner_type)} · {store.products_count ?? 0} منتج</p><span className="mt-4 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">زيارة المتجر</span></div><div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">{store.logo_url ? <img src={store.logo_url} alt="" className="h-full w-full object-cover" /> : <Store className="h-7 w-7 text-emerald-700" />}</div></Link>) : Array.from({ length: 5 }).map((_, index) => <Link key={index} href="https://ads.dasm.com.sa/advertise" className="group flex min-h-28 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl"><div><p className="text-sm font-extrabold">متجر مميز</p><p className="mt-1 text-xs text-slate-500">مساحة ظهور للمتاجر</p><span className="mt-4 inline-flex rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">احجز الظهور</span></div><div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-slate-100 bg-slate-50"><Store className="h-7 w-7 text-emerald-700" /></div></Link>)}</div></section>
          <section className="mx-auto max-w-7xl px-4 pb-8"><Link href="https://ads.dasm.com.sa/advertise" className="relative block overflow-hidden rounded-2xl bg-[#031b1e] px-6 py-5 text-white shadow-lg"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(45,212,191,.28),transparent_32%),linear-gradient(90deg,rgba(20,184,166,.22),transparent_55%)]" /><div className="relative z-10 flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-start"><span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-extrabold">أعلن الآن <Megaphone className="h-4 w-4" /></span><div><h2 className="text-2xl font-extrabold">مساحة إعلان بانر واسعة</h2><p className="mt-1 text-sm text-emerald-50/75">وصل لآلاف العملاء يوميًا على متاجر داسم</p></div><Target className="hidden h-16 w-16 text-emerald-200 md:block" /></div></Link></section>
          <section className="mx-auto max-w-7xl px-4 pb-8" id="categories"><h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold"><Blocks className="h-5 w-5 text-emerald-600" /> تصفح الأقسام</h2><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{categories.map((category) => { const Icon = category.icon; return <Link key={category.name} href={category.href} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"><div><p className="text-sm font-extrabold">{category.name}</p><p className="mt-1 text-xs text-slate-500">{category.description}</p></div><Icon className="h-8 w-8 text-slate-500" /></Link>; })}</div></section>
          <section className="mx-auto max-w-7xl px-4 pb-12" id="all-stores"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-extrabold">كل المتاجر</h2><p className="text-sm text-slate-500">{paginator.total} متجر</p></div>{stores.length ? <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">{stores.map((store) => <StoreCard key={store.id} store={store} />)}</div> : <div className="rounded-3xl border border-slate-200 bg-white py-20 text-center text-sm text-slate-500">لا توجد متاجر مطابقة حاليًا.</div>}</section>
          <section id="track-order" className="mx-auto max-w-7xl px-4 pb-12"><div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:items-center"><div><h2 className="text-xl font-extrabold">تتبع طلبك من المتجر</h2><p className="mt-2 text-sm text-slate-500">التتبع يعمل من داخل صفحة كل متجر عبر رقم الطلب. افتح المتجر ثم استخدم رابط التتبع الخاص به.</p></div><Link href="#stores" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700">اختر المتجر <PackageCheck className="h-4 w-4" /></Link></div></section>
        </main>
        <footer id="contact" className="border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.3fr_.7fr_.7fr]"><div><div className="flex items-center gap-3 text-2xl font-extrabold"><span>متاجر داسم</span><ShoppingBag className="h-7 w-7 text-emerald-700" /></div><p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">واجهة اكتشاف للمتاجر والمنتجات والإعلانات داخل منظومة داسم. صُممت لتخدم المتسوق، صاحب المتجر، والمعلن في صفحة واحدة.</p></div><div><h3 className="text-sm font-extrabold">روابط سريعة</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link href="#stores">استكشف المتاجر</Link><Link href="#categories">الأقسام</Link><Link href="#track-order">تتبع الطلب</Link></div></div><div><h3 className="text-sm font-extrabold">للإعلانات</h3><div className="mt-3 grid gap-2 text-sm text-slate-500"><Link href="https://ads.dasm.com.sa/advertise">طلب إعلان</Link><Link href="https://ads.dasm.com.sa">مركز إعلانات داسم</Link><Link href="/auth/login">تسجيل الدخول</Link></div></div></div></footer>
      </div>
    </>
  );
}
