/**
 * Block allowlist schema — the security boundary of the editor.
 *
 * Only block types and attributes declared here survive validation. Anything
 * the user (or a hired developer) writes that is not on this list is dropped,
 * not rendered. Combined with sanitizeText, a malicious paste collapses to an
 * empty/ugly block in the user's own store and nothing more.
 */

import type { Block, BlockAttrValue, BlockType, ThemeDesign } from "./types";
import { DEFAULT_DESIGN } from "./types";
import { sanitizeText, sanitizeList, sanitizeUrl } from "./sanitize";

type AttrKind = "string" | "number" | "boolean" | "list" | "url";

type AttrSpec = {
  kind: AttrKind;
  default: BlockAttrValue;
  /** For number kind. */
  min?: number;
  max?: number;
  /** For string kind: restrict to a fixed set of values. */
  oneOf?: readonly string[];
};

type BlockSpec = {
  labelAr: string;
  /** Whether store owners may delete this block in the editor (navbar/footer are recommended-keep). */
  removable: boolean;
  attrs: Record<string, AttrSpec>;
};

export const HERO_STYLES = ["aurora", "spotlight", "mesh", "silk", "neon", "showroom-banner"] as const;
export const SORT_OPTIONS = ["newest", "price-asc", "price-desc", "featured"] as const;
export const SPACER_SIZES = ["small", "medium", "large"] as const;
export const IMAGE_TEXT_LAYOUTS = ["image-right", "image-left"] as const;

export const BLOCK_SCHEMA: Record<BlockType, BlockSpec> = {
  navbar: {
    labelAr: "شريط التنقّل",
    removable: false,
    attrs: {
      logo: { kind: "boolean", default: true },
      links: { kind: "list", default: ["الرئيسية", "المنتجات", "تواصل"] },
      sticky: { kind: "boolean", default: true },
    },
  },
  banner: {
    labelAr: "شريط إعلان",
    removable: true,
    attrs: {
      text: { kind: "string", default: "شحن مجاني للطلبات فوق ٢٠٠ ر.س" },
    },
  },
  hero: {
    labelAr: "الواجهة الرئيسية",
    removable: true,
    attrs: {
      title: { kind: "string", default: "{{ store.name }}" },
      subtitle: { kind: "string", default: "تسوّق أفضل المنتجات بأناقة" },
      cta: { kind: "string", default: "تسوّق الآن" },
      style: { kind: "string", default: "aurora", oneOf: HERO_STYLES },
    },
  },
  richtext: {
    labelAr: "نص حر",
    removable: true,
    attrs: {
      title: { kind: "string", default: "عن المتجر" },
      body: { kind: "string", default: "اكتب نبذة عن متجرك هنا." },
    },
  },
  featured: {
    labelAr: "منتجات مميّزة",
    removable: true,
    attrs: {
      title: { kind: "string", default: "الأكثر مبيعاً" },
      limit: { kind: "number", default: 4, min: 2, max: 12 },
    },
  },
  "product-grid": {
    labelAr: "شبكة المنتجات",
    removable: true,
    attrs: {
      title: { kind: "string", default: "كل المنتجات" },
      cols: { kind: "number", default: 3, min: 2, max: 4 },
      sort: { kind: "string", default: "newest", oneOf: SORT_OPTIONS },
      limit: { kind: "number", default: 12, min: 4, max: 48 },
    },
  },
  announcement: {
    labelAr: "شريط الإعلان العلوي",
    removable: true,
    attrs: {
      text: { kind: "string", default: "أهلاً بك في متجرنا — تسوّق الآن" },
      link: { kind: "url", default: "" },
    },
  },
  features: {
    labelAr: "شريط المزايا",
    removable: true,
    attrs: {
      title: { kind: "string", default: "" },
      items: { kind: "list", default: ["شحن سريع", "دفع آمن", "إرجاع سهل", "دعم ٢٤/٧"] },
    },
  },
  categories: {
    labelAr: "بطاقات الأقسام",
    removable: true,
    attrs: {
      title: { kind: "string", default: "تسوّق حسب القسم" },
      items: { kind: "list", default: ["جديد", "العروض", "الأكثر مبيعاً", "إكسسوارات"] },
    },
  },
  "image-banner": {
    labelAr: "بانر صورة",
    removable: true,
    attrs: {
      image: { kind: "url", default: "" },
      title: { kind: "string", default: "عرض خاص" },
      subtitle: { kind: "string", default: "خصومات تصل إلى ٥٠٪" },
      cta: { kind: "string", default: "اكتشف العرض" },
      link: { kind: "url", default: "" },
    },
  },
  "image-with-text": {
    labelAr: "صورة مع نص",
    removable: true,
    attrs: {
      image: { kind: "url", default: "" },
      title: { kind: "string", default: "قصّة متجرنا" },
      body: { kind: "string", default: "نقدّم لك تشكيلة مختارة بعناية وجودة تستحقها." },
      cta: { kind: "string", default: "اعرف المزيد" },
      layout: { kind: "string", default: "image-right", oneOf: IMAGE_TEXT_LAYOUTS },
    },
  },
  brands: {
    labelAr: "شعارات الماركات",
    removable: true,
    attrs: {
      title: { kind: "string", default: "علاماتنا" },
      logos: { kind: "list", default: ["Apple", "Samsung", "Sony", "Anker"] },
    },
  },
  testimonials: {
    labelAr: "آراء العملاء",
    removable: true,
    attrs: {
      title: { kind: "string", default: "ماذا قال عملاؤنا" },
      quotes: { kind: "list", default: [] },
      authors: { kind: "list", default: [] },
    },
  },
  faq: {
    labelAr: "الأسئلة الشائعة",
    removable: true,
    attrs: {
      title: { kind: "string", default: "الأسئلة الشائعة" },
      questions: { kind: "list", default: ["كم مدة التوصيل؟", "هل الإرجاع متاح؟", "ما طرق الدفع؟"] },
      answers: { kind: "list", default: ["من ٢ إلى ٥ أيام عمل", "نعم خلال ١٤ يوماً", "بطاقات ومحافظ إلكترونية"] },
    },
  },
  newsletter: {
    labelAr: "النشرة البريدية",
    removable: true,
    attrs: {
      title: { kind: "string", default: "اشترك في نشرتنا" },
      subtitle: { kind: "string", default: "أحدث العروض في بريدك" },
      cta: { kind: "string", default: "اشتراك" },
    },
  },
  spacer: {
    labelAr: "مسافة فاصلة",
    removable: true,
    attrs: {
      size: { kind: "string", default: "medium", oneOf: SPACER_SIZES },
    },
  },
  footer: {
    labelAr: "التذييل",
    removable: false,
    attrs: {
      about: { kind: "string", default: "متجر داسم" },
      terms: { kind: "string", default: "الشروط والأحكام" },
      social: { kind: "list", default: ["whatsapp", "instagram"] },
    },
  },
};

export const ALLOWED_BLOCK_TYPES = Object.keys(BLOCK_SCHEMA) as BlockType[];

/**
 * Human/LLM-readable description of the allowed blocks, generated from the
 * schema so the AI prompt can never drift from the real allowlist.
 */
export function describeBlocksForPrompt(): string {
  return (Object.entries(BLOCK_SCHEMA) as [BlockType, BlockSpec][])
    .map(([type, spec]) => {
      const attrs = Object.entries(spec.attrs)
        .map(([name, a]) => {
          if (a.kind === "number") return `${name}=number(${a.min}-${a.max})`;
          if (a.kind === "boolean") return `${name}=bool`;
          if (a.kind === "list") return `${name}="a, b, c"`;
          if (a.kind === "url") return `${name}="https://..."`;
          if (a.oneOf) return `${name}=one_of(${a.oneOf.join("|")})`;
          return `${name}="text"`;
        })
        .join(" ");
      return `<${type} ${attrs} />`;
    })
    .join("\n");
}

export function isBlockType(value: string): value is BlockType {
  return Object.prototype.hasOwnProperty.call(BLOCK_SCHEMA, value);
}

function coerceNumber(value: unknown, spec: AttrSpec): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  const base = Number.isFinite(n) ? n : (spec.default as number);
  const min = spec.min ?? Number.MIN_SAFE_INTEGER;
  const max = spec.max ?? Number.MAX_SAFE_INTEGER;
  return Math.min(max, Math.max(min, base));
}

function coerceBoolean(value: unknown, spec: AttrSpec): boolean {
  if (value === true || value === "" || value === "true") return true;
  if (value === false || value === "false") return false;
  return spec.default as boolean;
}

function coerceString(value: unknown, spec: AttrSpec): string {
  const text = sanitizeText(value);
  if (spec.oneOf) {
    return spec.oneOf.includes(text) ? text : (spec.default as string);
  }
  return text || (spec.default as string);
}

function coerceUrl(value: unknown, spec: AttrSpec): string {
  // URLs may legitimately be empty (optional image/link) — fall back to default ("")
  return value === undefined ? (spec.default as string) : sanitizeUrl(value);
}

/**
 * Validate a raw parsed block against the allowlist: unknown types/attrs are
 * dropped, values are coerced+sanitized, and missing attrs get safe defaults.
 * Returns null if the block type is not allowed.
 */
export function validateBlock(type: string, rawAttrs: Record<string, unknown>, id: string): Block | null {
  if (!isBlockType(type)) return null;
  const spec = BLOCK_SCHEMA[type];
  const attrs: Record<string, BlockAttrValue> = {};

  for (const [name, attrSpec] of Object.entries(spec.attrs)) {
    const raw = rawAttrs[name];
    switch (attrSpec.kind) {
      case "number":
        attrs[name] = coerceNumber(raw, attrSpec);
        break;
      case "boolean":
        attrs[name] = coerceBoolean(name in rawAttrs ? raw : attrSpec.default, attrSpec);
        break;
      case "list":
        attrs[name] = raw === undefined ? (attrSpec.default as string[]) : sanitizeList(raw);
        break;
      case "url":
        attrs[name] = coerceUrl(raw, attrSpec);
        break;
      default:
        attrs[name] = coerceString(raw, attrSpec);
    }
  }

  // Universal "hidden" flag (visual show/hide) — allowed on any block.
  if (rawAttrs.hidden === true || rawAttrs.hidden === "" || rawAttrs.hidden === "true") {
    attrs.hidden = true;
  }

  return { id, type, attrs };
}

/** Allowed values for the design controls (used by the UI + validation). */
export const DESIGN_OPTIONS = {
  background: ["light", "soft", "dark"],
  buttonStyle: ["solid", "outline", "pill"],
  cornerRadius: ["sharp", "rounded", "round"],
  layoutWidth: ["boxed", "full"],
  productCardStyle: ["simple", "modern", "premium"],
  font: ["tajawal", "cairo", "system"],
} as const;

function pickOption<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && (options as readonly string[]).includes(value) ? (value as T) : fallback;
}

/** Coerce arbitrary input into a valid ThemeDesign (every field constrained). */
export function validateDesign(raw: unknown): ThemeDesign {
  const d = (raw && typeof raw === "object" ? raw : {}) as Partial<ThemeDesign>;
  const color = typeof d.themeColor === "string" && /^#[0-9a-fA-F]{6}$/.test(d.themeColor)
    ? d.themeColor
    : DEFAULT_DESIGN.themeColor;
  return {
    themeColor: color,
    background: pickOption(d.background, DESIGN_OPTIONS.background, DEFAULT_DESIGN.background),
    buttonStyle: pickOption(d.buttonStyle, DESIGN_OPTIONS.buttonStyle, DEFAULT_DESIGN.buttonStyle),
    cornerRadius: pickOption(d.cornerRadius, DESIGN_OPTIONS.cornerRadius, DEFAULT_DESIGN.cornerRadius),
    layoutWidth: pickOption(d.layoutWidth, DESIGN_OPTIONS.layoutWidth, DEFAULT_DESIGN.layoutWidth),
    productCardStyle: pickOption(d.productCardStyle, DESIGN_OPTIONS.productCardStyle, DEFAULT_DESIGN.productCardStyle),
    font: pickOption(d.font, DESIGN_OPTIONS.font, DEFAULT_DESIGN.font),
  };
}
