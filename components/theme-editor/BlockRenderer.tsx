"use client";

/**
 * In-browser live renderer: maps a validated block document to pre-built React
 * preview components. This is the "right pane" — it re-renders instantly as the
 * block source changes, mirroring how the public storefront composes the same
 * blocks. No HTML/Liquid is ever evaluated; each block type has a fixed render.
 */

import type { CSSProperties } from "react";
import { Heart, Menu, Search, ShoppingBag, Star } from "lucide-react";
import type { Block, BlockAttrValue } from "@/lib/themes/blocks";

export type PreviewContext = {
  storeName: string;
  primaryColor: string;
};

const SAMPLE_PRODUCTS = [
  { name: "سماعة لاسلكية", price: 199 },
  { name: "ساعة ذكية", price: 249 },
  { name: "شاحن سريع", price: 130 },
  { name: "حامل جوال", price: 70 },
  { name: "إضاءة مكتب", price: 215 },
  { name: "باور بانك", price: 160 },
  { name: "سماعة رأس", price: 320 },
  { name: "كيبورد", price: 185 },
];

function substitute(text: string, ctx: PreviewContext): string {
  return text.replace(/\{\{\s*store\.name\s*\}\}/g, ctx.storeName);
}

function str(v: BlockAttrValue | undefined, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function num(v: BlockAttrValue | undefined, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}
function list(v: BlockAttrValue | undefined): string[] {
  return Array.isArray(v) ? v : [];
}

function Navbar({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const links = list(block.attrs.links);
  return (
    <div className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2">
        {block.attrs.logo ? (
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ background: ctx.primaryColor }}
          >
            {ctx.storeName.slice(0, 1)}
          </div>
        ) : null}
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{ctx.storeName}</span>
      </div>
      <div className="hidden items-center gap-4 text-xs text-zinc-600 dark:text-zinc-400 sm:flex">
        {links.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-zinc-500">
        <Search className="h-4 w-4" />
        <ShoppingBag className="h-4 w-4" />
        <Menu className="h-4 w-4 sm:hidden" />
      </div>
    </div>
  );
}

function Banner({ block }: { block: Block }) {
  return (
    <div className="bg-zinc-900 px-4 py-2 text-center text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
      {str(block.attrs.text)}
    </div>
  );
}

function Hero({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const style: CSSProperties = {
    background: `linear-gradient(135deg, ${ctx.primaryColor}, ${ctx.primaryColor}22)`,
  };
  return (
    <div className="relative overflow-hidden px-6 py-12 text-center" style={style}>
      <h2 className="text-2xl font-extrabold text-white drop-shadow">{substitute(str(block.attrs.title), ctx)}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium text-white/90">{str(block.attrs.subtitle)}</p>
      <span className="mt-4 inline-block rounded-xl bg-white px-6 py-2 text-sm font-bold text-zinc-900 shadow">
        {str(block.attrs.cta)}
      </span>
    </div>
  );
}

function RichText({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  return (
    <div className="px-6 py-8 text-center">
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{substitute(str(block.attrs.title), ctx)}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {substitute(str(block.attrs.body), ctx)}
      </p>
    </div>
  );
}

function ProductCard({ name, price, color }: { name: string; price: number; color: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex aspect-[4/5] items-center justify-center bg-zinc-100 dark:bg-zinc-800">
        <ShoppingBag className="h-7 w-7 text-zinc-300" />
      </div>
      <div className="space-y-1 p-2">
        <p className="truncate text-xs font-semibold text-zinc-800 dark:text-zinc-200">{name}</p>
        <p className="text-sm font-bold" style={{ color }}>
          {price} ر.س
        </p>
      </div>
    </article>
  );
}

function Featured({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const limit = num(block.attrs.limit, 4);
  const items = SAMPLE_PRODUCTS.slice(0, limit);
  return (
    <div className="px-4 py-6">
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-4 w-4" style={{ color: ctx.primaryColor }} />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{str(block.attrs.title)}</h3>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {items.map((p, i) => (
          <div key={i} className="w-32 shrink-0">
            <ProductCard {...p} color={ctx.primaryColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductGrid({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const cols = num(block.attrs.cols, 3);
  const limit = num(block.attrs.limit, 6);
  const items = Array.from({ length: limit }, (_, i) => SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length]);
  const colClass = cols === 2 ? "grid-cols-2" : cols === 4 ? "grid-cols-4" : "grid-cols-3";
  return (
    <div className="px-4 py-6">
      <div className="mb-3 flex items-center gap-2">
        <Heart className="h-4 w-4" style={{ color: ctx.primaryColor }} />
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{str(block.attrs.title)}</h3>
      </div>
      <div className={`grid gap-3 ${colClass}`}>
        {items.map((p, i) => (
          <ProductCard key={i} {...p} color={ctx.primaryColor} />
        ))}
      </div>
    </div>
  );
}

function Footer({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  return (
    <div className="border-t border-zinc-200 bg-zinc-50 px-6 py-6 text-center dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{substitute(str(block.attrs.about), ctx)}</p>
      <p className="mt-1 text-xs text-zinc-500">{str(block.attrs.terms)}</p>
      <div className="mt-2 flex justify-center gap-2 text-[11px] text-zinc-400">
        {list(block.attrs.social).map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </div>
  );
}

function renderBlock(block: Block, ctx: PreviewContext) {
  switch (block.type) {
    case "navbar":
      return <Navbar block={block} ctx={ctx} />;
    case "banner":
      return <Banner block={block} />;
    case "hero":
      return <Hero block={block} ctx={ctx} />;
    case "richtext":
      return <RichText block={block} ctx={ctx} />;
    case "featured":
      return <Featured block={block} ctx={ctx} />;
    case "product-grid":
      return <ProductGrid block={block} ctx={ctx} />;
    case "footer":
      return <Footer block={block} ctx={ctx} />;
    default:
      return null;
  }
}

export function BlockRenderer({ blocks, ctx }: { blocks: Block[]; ctx: PreviewContext }) {
  if (!blocks.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-zinc-400">
        لا توجد بلوكات بعد — اكتب وسماً مثل &lt;hero /&gt; في المحرّر.
      </div>
    );
  }
  return (
    <div dir="rtl" className="bg-white dark:bg-zinc-900">
      {blocks.map((block) => (
        <div key={block.id}>{renderBlock(block, ctx)}</div>
      ))}
    </div>
  );
}
