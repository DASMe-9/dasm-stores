"use client";

/**
 * Generic visual field editor for a single block, driven entirely by
 * BLOCK_SCHEMA. The merchant edits friendly form controls — never code — and
 * the resulting attrs go back through the same validateBlock pipeline on save.
 */

import { BLOCK_SCHEMA } from "@/lib/themes/blocks";
import type { Block, BlockAttrValue } from "@/lib/themes/blocks";

const FIELD_LABEL_AR: Record<string, string> = {
  title: "العنوان",
  subtitle: "العنوان الفرعي",
  text: "النص",
  body: "المحتوى",
  cta: "زر الإجراء",
  about: "نبذة",
  terms: "الشروط",
  links: "الروابط",
  social: "التواصل",
  items: "العناصر",
  logos: "الشعارات",
  quotes: "الاقتباسات",
  authors: "الأسماء",
  questions: "الأسئلة",
  answers: "الإجابات",
  image: "الصورة (رابط)",
  link: "الرابط",
  logo: "إظهار الشعار",
  sticky: "تثبيت أعلى الصفحة",
  cols: "عدد الأعمدة",
  limit: "عدد المنتجات",
  sort: "الترتيب",
  style: "النمط",
  layout: "التخطيط",
  size: "الحجم",
};

type AttrSpec = {
  kind: "string" | "number" | "boolean" | "list" | "url";
  default: BlockAttrValue;
  min?: number;
  max?: number;
  oneOf?: readonly string[];
};

export function SectionFieldEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (attrs: Record<string, BlockAttrValue>) => void;
}) {
  const spec = BLOCK_SCHEMA[block.type];
  const set = (name: string, value: BlockAttrValue) => onChange({ ...block.attrs, [name]: value });

  return (
    <div className="space-y-3">
      {Object.entries(spec.attrs).map(([name, raw]) => {
        const attr = raw as AttrSpec;
        const label = FIELD_LABEL_AR[name] ?? name;
        const value = block.attrs[name] ?? attr.default;

        if (attr.kind === "boolean") {
          return (
            <label key={name} className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
              <input type="checkbox" checked={value === true} onChange={(e) => set(name, e.target.checked)} />
            </label>
          );
        }

        if (attr.kind === "number") {
          return (
            <label key={name} className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
              <input
                type="number"
                min={attr.min}
                max={attr.max}
                value={typeof value === "number" ? value : Number(attr.default)}
                onChange={(e) => set(name, Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          );
        }

        if (attr.oneOf) {
          return (
            <label key={name} className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
              <select
                value={typeof value === "string" ? value : String(attr.default)}
                onChange={(e) => set(name, e.target.value)}
                className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              >
                {attr.oneOf.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        if (attr.kind === "list") {
          const text = Array.isArray(value) ? value.join("، ") : "";
          return (
            <label key={name} className="block">
              <span className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label} (افصل بفاصلة)</span>
              <textarea
                rows={2}
                value={text}
                onChange={(e) => set(name, e.target.value.split(/[،,]/).map((s) => s.trim()).filter(Boolean))}
                className="w-full resize-none rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>
          );
        }

        // string + url
        return (
          <label key={name} className="block">
            <span className="mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300">{label}</span>
            <input
              type={attr.kind === "url" ? "url" : "text"}
              dir={attr.kind === "url" ? "ltr" : "rtl"}
              placeholder={attr.kind === "url" ? "https://…" : ""}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => set(name, e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        );
      })}
    </div>
  );
}
