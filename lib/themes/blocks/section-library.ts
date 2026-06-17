/**
 * Section Library for the visual builder's "Add Section" panel. Each entry maps
 * a friendly grouped item to a ready DSL snippet (which still flows through the
 * parser/validator on insert).
 */

import type { BlockType } from "./types";

export type SectionGroup = "header" | "hero" | "commerce" | "marketing" | "trust" | "content" | "footer";

export const SECTION_GROUP_LABEL_AR: Record<SectionGroup, string> = {
  header: "الترويسة",
  hero: "الواجهة",
  commerce: "المتجر",
  marketing: "التسويق",
  trust: "الثقة",
  content: "المحتوى",
  footer: "التذييل",
};

export type SectionLibraryItem = {
  type: BlockType;
  labelAr: string;
  group: SectionGroup;
  snippet: string;
};

export const SECTION_LIBRARY: SectionLibraryItem[] = [
  { type: "navbar", group: "header", labelAr: "شريط التنقّل", snippet: `<navbar logo links="الرئيسية, المنتجات, تواصل" sticky />` },
  { type: "announcement", group: "header", labelAr: "شريط إعلان علوي", snippet: `<announcement text="عرض خاص لفترة محدودة" />` },

  { type: "hero", group: "hero", labelAr: "واجهة بزر", snippet: `<hero title="{{ store.name }}" subtitle="نبذة جذابة" cta="تسوّق الآن" style="aurora" />` },
  { type: "image-banner", group: "hero", labelAr: "بانر صورة", snippet: `<image-banner title="عرض خاص" subtitle="خصومات تصل ٥٠٪" cta="اكتشف العرض" />` },

  { type: "categories", group: "commerce", labelAr: "بطاقات الأقسام", snippet: `<categories title="تسوّق حسب القسم" items="جديد, العروض, الأكثر مبيعاً, إكسسوارات" />` },
  { type: "featured", group: "commerce", labelAr: "منتجات مميّزة", snippet: `<featured title="الأكثر مبيعاً" limit="4" />` },
  { type: "product-grid", group: "commerce", labelAr: "شبكة المنتجات", snippet: `<product-grid title="كل المنتجات" cols="3" sort="newest" />` },

  { type: "image-with-text", group: "marketing", labelAr: "صورة مع نص", snippet: `<image-with-text title="قصّة متجرنا" body="نقدّم لك تشكيلة مختارة بعناية." cta="اعرف المزيد" layout="image-right" />` },
  { type: "newsletter", group: "marketing", labelAr: "النشرة البريدية", snippet: `<newsletter title="اشترك في نشرتنا" subtitle="أحدث العروض في بريدك" cta="اشتراك" />` },
  { type: "banner", group: "marketing", labelAr: "شريط ترويجي", snippet: `<banner text="شحن مجاني للطلبات فوق ٢٠٠ ر.س" />` },

  { type: "features", group: "trust", labelAr: "شريط المزايا", snippet: `<features items="شحن سريع, دفع آمن, إرجاع سهل, دعم ٢٤/٧" />` },
  { type: "testimonials", group: "trust", labelAr: "آراء العملاء", snippet: `<testimonials title="ماذا قال عملاؤنا" quotes="منتجات رائعة, خدمة ممتازة, تجربة سهلة" authors="أحمد, سارة, خالد" />` },
  { type: "brands", group: "trust", labelAr: "شعارات الماركات", snippet: `<brands title="علاماتنا" logos="Apple, Samsung, Sony, Anker" />` },

  { type: "richtext", group: "content", labelAr: "نص حر", snippet: `<richtext title="عن المتجر" body="اكتب نبذتك هنا." />` },
  { type: "faq", group: "content", labelAr: "الأسئلة الشائعة", snippet: `<faq title="الأسئلة الشائعة" questions="كم مدة التوصيل؟, هل الإرجاع متاح؟" answers="من ٢ إلى ٥ أيام, نعم خلال ١٤ يوماً" />` },
  { type: "spacer", group: "content", labelAr: "مسافة فاصلة", snippet: `<spacer size="medium" />` },

  { type: "footer", group: "footer", labelAr: "التذييل", snippet: `<footer about="{{ store.name }}" terms="الشروط والأحكام" social="whatsapp, instagram" />` },
];

export const SECTION_GROUPS: SectionGroup[] = ["header", "hero", "commerce", "marketing", "trust", "content", "footer"];
