/**
 * Block allowlist schema — the security boundary of the editor.
 *
 * Only block types and attributes declared here survive validation. Anything
 * the user (or a hired developer) writes that is not on this list is dropped,
 * not rendered. Combined with sanitizeText, a malicious paste collapses to an
 * empty/ugly block in the user's own store and nothing more.
 */

import type { Block, BlockAttrValue, BlockType } from "./types";
import { sanitizeText, sanitizeList } from "./sanitize";

type AttrKind = "string" | "number" | "boolean" | "list";

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
      default:
        attrs[name] = coerceString(raw, attrSpec);
    }
  }

  return { id, type, attrs };
}
