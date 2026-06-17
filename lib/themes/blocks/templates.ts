/**
 * Phase 4 — free ready-made store templates ("Canva for DASM Stores").
 *
 * Each template populates BOTH surfaces (landing + products) and a matching
 * design. Templates are expressed as block arrays and serialized to DSL source,
 * so they pass through the exact same parser/validator/sanitizer as anything
 * else — there is no privileged/raw path.
 *
 * Redesign note: every template uses a DISTINCT composition tuned to its vertical
 * (different block mix + order + rhythm), using only existing block types.
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

const navbar = () => b("navbar", { logo: true, links: ["الرئيسية", "المنتجات", "تواصل"], sticky: true });
const footer = () => b("footer", { about: "{{ store.name }}", terms: "الشروط والأحكام", social: ["whatsapp", "instagram"] });

/** Products surface: a trust strip + catalog (no heavy hero). */
function productsPage(headerTitle: string, cols: number): Block[] {
  return [
    navbar(),
    b("richtext", { title: headerTitle, body: "تصفّح كامل تشكيلتنا واستخدم الفرز للوصول الأسرع." }),
    b("features", { items: ["شحن سريع", "دفع آمن", "إرجاع سهل", "دعم ٢٤/٧"] }),
    b("product-grid", { title: "كل المنتجات", cols, sort: "newest", limit: 24 }),
    footer(),
  ];
}

const design = (over: Partial<ThemeDesign>): ThemeDesign => ({ ...DEFAULT_DESIGN, ...over });

export const STORE_TEMPLATES: StoreTemplate[] = [
  {
    // Utility-first, dense, objection-handling (fitment/warranty) — for parts shoppers.
    id: "auto-accessories",
    nameAr: "متجر إكسسوارات السيارات",
    nameEn: "Auto Accessories Store",
    category: "سيارات",
    description: "عملي وكثيف: أقسام واضحة، شبكة واسعة، وأسئلة التوافق والضمان.",
    accent: "#dc2626",
    landing: [
      navbar(),
      b("announcement", { text: "تركيب مجاني للطلبات فوق ٣٠٠ ر.س" }),
      b("hero", { title: "{{ store.name }}", subtitle: "كل ما تحتاجه لسيارتك في مكان واحد", cta: "تسوّق الآن", style: "showroom-banner" }),
      b("features", { items: ["قطع أصلية", "شحن سريع", "ضمان سنة", "دعم فني"] }),
      b("categories", { title: "تسوّق حسب القسم", items: ["إضاءة", "صوتيات", "عناية", "إكسسوارات داخلية", "إطارات", "شواحن"] }),
      b("product-grid", { title: "أحدث المنتجات", cols: 4, sort: "newest", limit: 8 }),
      b("image-banner", { title: "عروض الموسم", subtitle: "خصومات على قطع مختارة", cta: "اكتشف العرض" }),
      b("featured", { title: "الأكثر طلباً", limit: 4 }),
      b("faq", {
        title: "أسئلة شائعة",
        questions: ["هل القطعة تناسب سيارتي؟", "ما مدة الضمان؟", "كم يستغرق التركيب؟"],
        answers: ["أرسل لنا الموديل ونؤكد التوافق", "ضمان سنة على القطع الأصلية", "تركيب فوري في الفروع المعتمدة"],
      }),
      footer(),
    ],
    products: productsPage("منتجات السيارات", 4),
    design: design({ themeColor: "#dc2626", productCardStyle: "modern", cornerRadius: "rounded", background: "light" }),
  },
  {
    // Editorial, image-led, story + social proof + retention — for fashion browsing.
    id: "fashion-boutique",
    nameAr: "بوتيك أزياء",
    nameEn: "Fashion Boutique",
    category: "أزياء",
    description: "تحريري وأنيق: قصة بصرية، إطلالات مختارة، آراء، ونشرة بريدية.",
    accent: "#db2777",
    landing: [
      navbar(),
      b("announcement", { text: "توصيل مجاني هذا الأسبوع" }),
      b("hero", { title: "{{ store.name }}", subtitle: "أناقة تبدأ من هنا", cta: "اكتشفي المجموعة", style: "silk" }),
      b("image-with-text", { title: "قصّة العلامة", body: "قطع مختارة بعناية بخامات فاخرة تدوم.", cta: "تعرّفي علينا", layout: "image-right" }),
      b("categories", { title: "تسوّقي حسب الإطلالة", items: ["جديد", "فساتين", "إكسسوارات", "تخفيضات"] }),
      b("featured", { title: "إطلالات مختارة", limit: 4 }),
      b("image-banner", { title: "تشكيلة الموسم", subtitle: "ألوان جديدة وصلت", cta: "تسوّقي الآن" }),
      b("product-grid", { title: "كل القطع", cols: 3, sort: "newest", limit: 6 }),
      b("testimonials", {
        title: "ماذا قالت عميلاتنا",
        quotes: ["خامات راقية وتوصيل سريع", "المقاسات دقيقة جداً", "تجربة تسوّق ممتعة"],
        authors: ["نورة", "ريم", "لمياء"],
      }),
      b("newsletter", { title: "كوني أول من يعرف", subtitle: "وصول جديد وعروض حصرية في بريدك", cta: "اشتراك" }),
      footer(),
    ],
    products: productsPage("تشكيلتنا", 3),
    design: design({ themeColor: "#db2777", productCardStyle: "premium", cornerRadius: "round", background: "soft", font: "cairo" }),
  },
  {
    // Deal-driven, spec trust (brand logos) + warranty FAQ + dense grid — for electronics.
    id: "electronics",
    nameAr: "متجر إلكترونيات",
    nameEn: "Electronics Store",
    category: "إلكترونيات",
    description: "موجّه بالعروض: شعارات موثوقة، شبكة كثيفة، وضمان وأسئلة الشحن.",
    accent: "#2563eb",
    landing: [
      navbar(),
      b("announcement", { text: "ضمان سنة على كل الأجهزة + تقسيط متاح" }),
      b("hero", { title: "{{ store.name }}", subtitle: "أحدث الأجهزة بأفضل الأسعار", cta: "تسوّق الآن", style: "neon" }),
      b("features", { items: ["أصلي ١٠٠٪", "دفع آمن", "شحن سريع", "تقسيط"] }),
      b("brands", { title: "وكلاء معتمدون", logos: ["Apple", "Samsung", "Sony", "Anker", "JBL"] }),
      b("categories", { title: "تسوّق حسب الفئة", items: ["جوالات", "سماعات", "إكسسوارات", "ساعات ذكية", "ألعاب", "منزل ذكي"] }),
      b("featured", { title: "الأكثر مبيعاً", limit: 4 }),
      b("image-banner", { title: "عروض التقنية", subtitle: "خصومات تصل ٤٠٪", cta: "اغتنم العرض" }),
      b("product-grid", { title: "أحدث الأجهزة", cols: 4, sort: "newest", limit: 8 }),
      b("faq", {
        title: "أسئلة شائعة",
        questions: ["هل الأجهزة أصلية بضمان؟", "كم مدة الشحن؟", "هل التقسيط متاح؟"],
        answers: ["نعم، أصلية بضمان الوكيل", "من ٢ إلى ٤ أيام عمل", "نعم عبر المحافظ والبطاقات"],
      }),
      footer(),
    ],
    products: productsPage("كل الأجهزة", 4),
    design: design({ themeColor: "#2563eb", productCardStyle: "modern", cornerRadius: "rounded", background: "light" }),
  },
  {
    // Soft, trust + routine story + reviews + retention — for beauty/care.
    id: "beauty",
    nameAr: "متجر تجميل",
    nameEn: "Beauty Store",
    category: "جمال",
    description: "ناعم وموثوق: روتين بصري، آراء حقيقية، ونشرة عناية.",
    accent: "#9333ea",
    landing: [
      navbar(),
      b("announcement", { text: "هدية مع كل طلب + توصيل سريع" }),
      b("hero", { title: "{{ store.name }}", subtitle: "جمالك يستحق الأفضل", cta: "اكتشفي الآن", style: "aurora" }),
      b("features", { items: ["منتجات أصلية", "آمنة للبشرة", "توصيل سريع", "استشارة مجانية"] }),
      b("image-with-text", { title: "روتين العناية المثالي", body: "خطوات بسيطة بمنتجات موثوقة لنتائج تدوم.", cta: "ابدئي الروتين", layout: "image-left" }),
      b("categories", { title: "تسوّقي حسب الحاجة", items: ["العناية", "المكياج", "العطور", "الشعر"] }),
      b("featured", { title: "مفضّلات العميلات", limit: 4 }),
      b("product-grid", { title: "كل المنتجات", cols: 3, sort: "newest", limit: 6 }),
      b("testimonials", {
        title: "تجارب حقيقية",
        quotes: ["بشرتي تحسّنت خلال أسبوعين", "روائح فخمة وتدوم", "خدمة عملاء راقية"],
        authors: ["هند", "جواهر", "العنود"],
      }),
      b("newsletter", { title: "نصائح وعروض عناية", subtitle: "اشتركي لأحدث المنتجات والخصومات", cta: "اشتراك" }),
      footer(),
    ],
    products: productsPage("منتجات التجميل", 3),
    design: design({ themeColor: "#9333ea", productCardStyle: "premium", cornerRadius: "round", background: "soft" }),
  },
  {
    // Discovery-first: prominent categories + daily-deal banner + retention.
    id: "marketplace",
    nameAr: "متجر عام متعدّد الأقسام",
    nameEn: "General Marketplace Store",
    category: "عام",
    description: "للاكتشاف: أقسام بارزة، صفقات يومية، وشبكة واسعة.",
    accent: "#059669",
    landing: [
      navbar(),
      b("announcement", { text: "عروض يومية متجدّدة على كل الأقسام" }),
      b("hero", { title: "{{ store.name }}", subtitle: "كل ما تحتاجه في متجر واحد", cta: "تسوّق الآن", style: "mesh" }),
      b("categories", { title: "تصفّح الأقسام", items: ["العروض", "الأكثر مبيعاً", "وصل حديثاً", "إلكترونيات", "منزل", "أطفال"] }),
      b("features", { items: ["تشكيلة واسعة", "أسعار منافسة", "شحن سريع", "إرجاع سهل"] }),
      b("featured", { title: "مختارات لك", limit: 4 }),
      b("banner", { text: "صفقات اليوم — لا تفوّت الفرصة قبل انتهاء الكمية" }),
      b("product-grid", { title: "كل المنتجات", cols: 4, sort: "newest", limit: 8 }),
      b("newsletter", { title: "لا تفوّت صفقة", subtitle: "أفضل العروض يومياً في بريدك", cta: "اشتراك" }),
      footer(),
    ],
    products: productsPage("كل المنتجات", 4),
    design: design({ themeColor: "#059669", productCardStyle: "simple", cornerRadius: "rounded", background: "light" }),
  },
  {
    // Sparse, elegant, generous rhythm: heritage story + brands + reviews. No dense grid clutter.
    id: "luxury",
    nameAr: "متجر فاخر",
    nameEn: "Luxury / Premium Store",
    category: "فاخر",
    description: "راقٍ ومتنفّس: سرد التراث، علامات، وآراء — بإيقاع هادئ.",
    accent: "#c9a227",
    landing: [
      navbar(),
      b("announcement", { text: "خدمة تغليف فاخرة مجانية" }),
      b("hero", { title: "{{ store.name }}", subtitle: "تجربة تسوّق استثنائية", cta: "اكتشف المجموعة", style: "spotlight" }),
      b("spacer", { size: "large" }),
      b("image-with-text", { title: "إرث من الجودة", body: "نختار كل قطعة بعناية لتعكس الرقي والتميّز.", cta: "قصّتنا", layout: "image-right" }),
      b("featured", { title: "قطع مختارة", limit: 4 }),
      b("spacer", { size: "large" }),
      b("image-banner", { title: "الإصدار الحصري", subtitle: "متوفّر لفترة محدودة", cta: "اطّلع الآن" }),
      b("product-grid", { title: "المجموعة", cols: 3, sort: "featured", limit: 6 }),
      b("brands", { title: "علامات شريكة", logos: ["Rolex", "Hermès", "Cartier", "Chanel"] }),
      b("testimonials", {
        title: "آراء عملائنا المميّزين",
        quotes: ["تجربة شراء استثنائية", "جودة وتغليف يليق بالهدية", "خدمة شخصية راقية"],
        authors: ["عبدالله", "ميساء", "فيصل"],
      }),
      footer(),
    ],
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
