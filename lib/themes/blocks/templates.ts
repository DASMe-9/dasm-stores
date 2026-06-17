/**
 * Phase 4 — free ready-made store templates ("Canva for DASM Stores").
 *
 * Each template populates BOTH surfaces (landing + products) and a matching
 * design. Templates are expressed as block arrays and serialized to DSL source,
 * so they pass through the exact same parser/validator/sanitizer as anything
 * else — there is no privileged/raw path.
 */

import type { Block, BlockDocument, ThemeDesign } from "./types";
import { BLOCK_EDITOR_VERSION, DEFAULT_DESIGN } from "./types";
import { serializeBlocks } from "./parse";

export type StoreTemplate = {
  id: string;
  nameAr: string;
  nameEn: string;
  category: string;
  description: string;
  /** Accent color used on the gallery card (also the theme color). */
  accent: string;
  landing: Block[];
  products: Block[];
  design: ThemeDesign;
};

let _id = 0;
const b = (type: Block["type"], attrs: Block["attrs"] = {}): Block => ({ id: `t${++_id}`, type, attrs });

function landing(opts: {
  hero: { title: string; subtitle: string; cta: string; style: string };
  announcement: string;
  features: string[];
  categories: string[];
  featuredTitle: string;
  bannerTitle: string;
  bannerSubtitle: string;
  gridTitle: string;
  cols: number;
}): Block[] {
  return [
    b("navbar", { logo: true, links: ["الرئيسية", "المنتجات", "تواصل"], sticky: true }),
    b("announcement", { text: opts.announcement }),
    b("hero", { title: opts.hero.title, subtitle: opts.hero.subtitle, cta: opts.hero.cta, style: opts.hero.style }),
    b("features", { items: opts.features }),
    b("categories", { title: "تسوّق حسب القسم", items: opts.categories }),
    b("featured", { title: opts.featuredTitle, limit: 4 }),
    b("image-banner", { title: opts.bannerTitle, subtitle: opts.bannerSubtitle, cta: "اكتشف العرض" }),
    b("product-grid", { title: opts.gridTitle, cols: opts.cols, sort: "newest", limit: 8 }),
    b("footer", { about: "{{ store.name }}", terms: "الشروط والأحكام", social: ["whatsapp", "instagram"] }),
  ];
}

function productsPage(headerTitle: string, cols: number): Block[] {
  return [
    b("navbar", { logo: true, links: ["الرئيسية", "المنتجات", "تواصل"], sticky: true }),
    b("richtext", { title: headerTitle, body: "تصفّح كامل تشكيلتنا واستخدم الفرز للوصول الأسرع." }),
    b("product-grid", { title: "كل المنتجات", cols, sort: "newest", limit: 24 }),
    b("footer", { about: "{{ store.name }}", terms: "الشروط والأحكام", social: ["whatsapp", "instagram"] }),
  ];
}

const design = (over: Partial<ThemeDesign>): ThemeDesign => ({ ...DEFAULT_DESIGN, ...over });

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    id: "auto-accessories",
    nameAr: "متجر إكسسوارات السيارات",
    nameEn: "Auto Accessories Store",
    category: "سيارات",
    description: "قطع غيار وإكسسوارات بعرض عملي وواضح.",
    accent: "#dc2626",
    landing: landing({
      hero: { title: "{{ store.name }}", subtitle: "كل ما تحتاجه لسيارتك في مكان واحد", cta: "تسوّق الآن", style: "showroom-banner" },
      announcement: "تركيب مجاني للطلبات فوق ٣٠٠ ر.س",
      features: ["قطع أصلية", "شحن سريع", "ضمان", "دعم فني"],
      categories: ["إضاءة", "صوتيات", "عناية", "إكسسوارات داخلية"],
      featuredTitle: "الأكثر طلباً",
      bannerTitle: "عروض الموسم", bannerSubtitle: "خصومات على قطع مختارة",
      gridTitle: "أحدث المنتجات", cols: 3,
    }),
    products: productsPage("منتجات السيارات", 3),
    design: design({ themeColor: "#dc2626", productCardStyle: "modern", cornerRadius: "rounded", background: "light" }),
  },
  {
    id: "fashion-boutique",
    nameAr: "بوتيك أزياء",
    nameEn: "Fashion Boutique",
    category: "أزياء",
    description: "عرض أنيق بمساحات واسعة وصور كبيرة.",
    accent: "#db2777",
    landing: landing({
      hero: { title: "{{ store.name }}", subtitle: "أناقة تبدأ من هنا", cta: "اكتشفي المجموعة", style: "silk" },
      announcement: "توصيل مجاني هذا الأسبوع",
      features: ["قياسات دقيقة", "إرجاع سهل", "خامات فاخرة", "وصول سريع"],
      categories: ["جديد", "فساتين", "إكسسوارات", "تخفيضات"],
      featuredTitle: "إطلالات مختارة",
      bannerTitle: "تشكيلة الموسم", bannerSubtitle: "ألوان جديدة وصلت",
      gridTitle: "كل القطع", cols: 3,
    }),
    products: productsPage("تشكيلتنا", 3),
    design: design({ themeColor: "#db2777", productCardStyle: "premium", cornerRadius: "round", background: "soft", font: "cairo" }),
  },
  {
    id: "electronics",
    nameAr: "متجر إلكترونيات",
    nameEn: "Electronics Store",
    category: "إلكترونيات",
    description: "شبكة منتجات كثيفة وعملية للأجهزة.",
    accent: "#2563eb",
    landing: landing({
      hero: { title: "{{ store.name }}", subtitle: "أحدث الأجهزة بأفضل الأسعار", cta: "تسوّق الآن", style: "neon" },
      announcement: "ضمان سنة على كل الأجهزة",
      features: ["أصلي ١٠٠٪", "دفع آمن", "شحن سريع", "تقسيط"],
      categories: ["جوالات", "سماعات", "إكسسوارات", "ساعات ذكية"],
      featuredTitle: "الأكثر مبيعاً",
      bannerTitle: "عروض التقنية", bannerSubtitle: "خصومات تصل ٤٠٪",
      gridTitle: "أحدث الأجهزة", cols: 4,
    }),
    products: productsPage("كل الأجهزة", 4),
    design: design({ themeColor: "#2563eb", productCardStyle: "modern", cornerRadius: "rounded", background: "light" }),
  },
  {
    id: "beauty",
    nameAr: "متجر تجميل",
    nameEn: "Beauty Store",
    category: "جمال",
    description: "ألوان ناعمة وعرض راقٍ لمنتجات العناية.",
    accent: "#9333ea",
    landing: landing({
      hero: { title: "{{ store.name }}", subtitle: "جمالك يستحق الأفضل", cta: "اكتشفي الآن", style: "aurora" },
      announcement: "هدية مع كل طلب",
      features: ["منتجات أصلية", "آمنة للبشرة", "توصيل سريع", "استشارة مجانية"],
      categories: ["العناية", "المكياج", "العطور", "الشعر"],
      featuredTitle: "مفضّلات العملاء",
      bannerTitle: "روتين العناية", bannerSubtitle: "تشكيلة جديدة وصلت",
      gridTitle: "كل المنتجات", cols: 3,
    }),
    products: productsPage("منتجات التجميل", 3),
    design: design({ themeColor: "#9333ea", productCardStyle: "premium", cornerRadius: "round", background: "soft" }),
  },
  {
    id: "marketplace",
    nameAr: "متجر عام متعدّد الأقسام",
    nameEn: "General Marketplace Store",
    category: "عام",
    description: "تخطيط متوازن يناسب كل أنواع المنتجات.",
    accent: "#059669",
    landing: landing({
      hero: { title: "{{ store.name }}", subtitle: "كل ما تحتاجه في متجر واحد", cta: "تسوّق الآن", style: "mesh" },
      announcement: "عروض يومية متجدّدة",
      features: ["تشكيلة واسعة", "أسعار منافسة", "شحن سريع", "إرجاع سهل"],
      categories: ["العروض", "الأكثر مبيعاً", "وصل حديثاً", "كل الأقسام"],
      featuredTitle: "مختارات لك",
      bannerTitle: "صفقات اليوم", bannerSubtitle: "لا تفوّت الفرصة",
      gridTitle: "كل المنتجات", cols: 4,
    }),
    products: productsPage("كل المنتجات", 4),
    design: design({ themeColor: "#059669", productCardStyle: "simple", cornerRadius: "rounded", background: "light" }),
  },
  {
    id: "luxury",
    nameAr: "متجر فاخر",
    nameEn: "Luxury / Premium Store",
    category: "فاخر",
    description: "خلفية داكنة وذهبية لإحساس راقٍ.",
    accent: "#c9a227",
    landing: landing({
      hero: { title: "{{ store.name }}", subtitle: "تجربة تسوّق استثنائية", cta: "اكتشف المجموعة", style: "spotlight" },
      announcement: "خدمة تغليف فاخرة مجانية",
      features: ["جودة فائقة", "حصري", "توصيل مميّز", "خدمة شخصية"],
      categories: ["المجموعة الجديدة", "الأكثر طلباً", "إصدارات محدودة", "هدايا"],
      featuredTitle: "قطع مختارة",
      bannerTitle: "الإصدار الحصري", bannerSubtitle: "متوفّر لفترة محدودة",
      gridTitle: "المجموعة الكاملة", cols: 3,
    }),
    products: productsPage("المجموعة", 3),
    design: design({ themeColor: "#c9a227", productCardStyle: "premium", cornerRadius: "sharp", background: "dark" }),
  },
];

export function findTemplate(id: string): StoreTemplate | undefined {
  return STORE_TEMPLATES.find((t) => t.id === id);
}

/** Build a full block document from a template (both surfaces + design). */
export function templateToBlockDocument(template: StoreTemplate): BlockDocument {
  return {
    version: BLOCK_EDITOR_VERSION,
    surfaces: {
      landing: serializeBlocks(template.landing),
      products: serializeBlocks(template.products),
    },
    design: { ...template.design },
  };
}
