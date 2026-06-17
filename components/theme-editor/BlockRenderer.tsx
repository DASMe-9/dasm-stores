"use client";

/**
 * In-browser live renderer: maps a validated block document to pre-built React
 * preview components. This is the "right pane" — it re-renders instantly as the
 * block source changes, mirroring how the public storefront composes the same
 * blocks. No HTML/Liquid is ever evaluated; each block type has a fixed render.
 */

import type { CSSProperties } from "react";
import {
  ChevronDown,
  Heart,
  Mail,
  Menu,
  Quote,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Tag,
} from "lucide-react";
import type { Block, BlockAttrValue, ThemeDesign } from "@/lib/themes/blocks";

export type PreviewProduct = {
  name: string;
  price: number;
  image?: string | null;
};

export type PreviewContext = {
  storeName: string;
  primaryColor: string;
  /** Real store products; falls back to samples when empty. */
  products?: PreviewProduct[];
  /** Global design controls (optional; applied where relevant). */
  design?: ThemeDesign;
};

const SAMPLE_PRODUCTS: PreviewProduct[] = [
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

/** Real products when available, otherwise the placeholder samples. */
function productItems(ctx: PreviewContext, count: number): PreviewProduct[] {
  const source = ctx.products && ctx.products.length ? ctx.products : SAMPLE_PRODUCTS;
  return Array.from({ length: count }, (_, i) => source[i % source.length]);
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

function ProductCard({ name, price, image, color }: PreviewProduct & { color: string }) {
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <ShoppingBag className="h-7 w-7 text-zinc-300" />
        )}
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
  const items = productItems(ctx, limit);
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
  const items = productItems(ctx, limit);
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

function Announcement({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const text = substitute(str(block.attrs.text), ctx);
  return (
    <div className="px-4 py-1.5 text-center text-[11px] font-semibold text-white" style={{ background: ctx.primaryColor }}>
      {text}
    </div>
  );
}

function Features({ block }: { block: Block }) {
  const items = list(block.attrs.items);
  return (
    <div className="border-y border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

function Categories({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const items = list(block.attrs.items);
  return (
    <div className="px-4 py-6">
      {str(block.attrs.title) ? (
        <div className="mb-3 flex items-center gap-2">
          <Tag className="h-4 w-4" style={{ color: ctx.primaryColor }} />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{str(block.attrs.title)}</h3>
        </div>
      ) : null}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={i}
            className="flex h-16 items-center justify-center rounded-xl text-center text-xs font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${ctx.primaryColor}, ${ctx.primaryColor}99)` }}
          >
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageBanner({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const image = str(block.attrs.image);
  const style: CSSProperties = image
    ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${ctx.primaryColor}, ${ctx.primaryColor}55)` };
  return (
    <div className="relative px-4 py-3">
      <div className="relative flex min-h-[120px] flex-col items-center justify-center overflow-hidden rounded-2xl px-6 py-8 text-center" style={style}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10">
          <h3 className="text-lg font-extrabold text-white drop-shadow">{str(block.attrs.title)}</h3>
          <p className="mt-1 text-xs font-medium text-white/90">{str(block.attrs.subtitle)}</p>
          {str(block.attrs.cta) ? (
            <span className="mt-3 inline-block rounded-lg bg-white px-4 py-1.5 text-xs font-bold text-zinc-900">
              {str(block.attrs.cta)}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ImageWithText({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const image = str(block.attrs.image);
  const imageLeft = str(block.attrs.layout) === "image-left";
  const media = (
    <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={str(block.attrs.title)} className="h-full w-full object-cover" />
      ) : (
        <ShoppingBag className="h-8 w-8 text-zinc-300" />
      )}
    </div>
  );
  const text = (
    <div className="flex flex-col justify-center">
      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{substitute(str(block.attrs.title), ctx)}</h3>
      <p className="mt-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{str(block.attrs.body)}</p>
      {str(block.attrs.cta) ? (
        <span className="mt-3 inline-block w-fit rounded-lg px-4 py-1.5 text-xs font-bold text-white" style={{ background: ctx.primaryColor }}>
          {str(block.attrs.cta)}
        </span>
      ) : null}
    </div>
  );
  return (
    <div className="grid grid-cols-2 gap-4 px-4 py-6">
      {imageLeft ? (
        <>
          {media}
          {text}
        </>
      ) : (
        <>
          {text}
          {media}
        </>
      )}
    </div>
  );
}

function Brands({ block }: { block: Block }) {
  const logos = list(block.attrs.logos);
  return (
    <div className="px-4 py-5">
      {str(block.attrs.title) ? (
        <p className="mb-2 text-center text-[11px] font-semibold text-zinc-400">{str(block.attrs.title)}</p>
      ) : null}
      <div className="flex flex-wrap items-center justify-center gap-4">
        {logos.map((b, i) => {
          const isUrl = /^https?:\/\//i.test(b);
          return isUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={b} alt="brand" className="h-6 w-auto object-contain opacity-70" />
          ) : (
            <span key={i} className="text-sm font-bold text-zinc-400">
              {b}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Testimonials({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  const quotes = list(block.attrs.quotes);
  const authors = list(block.attrs.authors);
  return (
    <div className="px-4 py-6">
      <h3 className="mb-3 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">{str(block.attrs.title)}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {quotes.map((q, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <Quote className="h-4 w-4" style={{ color: ctx.primaryColor }} />
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">{q}</p>
            <p className="mt-2 text-[11px] font-bold text-zinc-500">— {authors[i] ?? "عميل"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Faq({ block }: { block: Block }) {
  const questions = list(block.attrs.questions);
  const answers = list(block.attrs.answers);
  return (
    <div className="px-4 py-6">
      <h3 className="mb-3 text-center text-sm font-bold text-zinc-900 dark:text-zinc-100">{str(block.attrs.title)}</h3>
      <div className="mx-auto max-w-lg space-y-2">
        {questions.map((q, i) => (
          <div key={i} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{q}</p>
              <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
            </div>
            {answers[i] ? <p className="mt-1 text-[11px] text-zinc-500">{answers[i]}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function Newsletter({ block, ctx }: { block: Block; ctx: PreviewContext }) {
  return (
    <div className="px-4 py-8 text-center">
      <Mail className="mx-auto h-5 w-5" style={{ color: ctx.primaryColor }} />
      <h3 className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">{str(block.attrs.title)}</h3>
      <p className="mt-1 text-xs text-zinc-500">{str(block.attrs.subtitle)}</p>
      <div className="mx-auto mt-3 flex max-w-xs items-center gap-2">
        <span className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-[11px] text-zinc-400 dark:border-zinc-700">
          بريدك الإلكتروني
        </span>
        <span className="rounded-lg px-3 py-1.5 text-[11px] font-bold text-white" style={{ background: ctx.primaryColor }}>
          {str(block.attrs.cta)}
        </span>
      </div>
    </div>
  );
}

function Spacer({ block }: { block: Block }) {
  const size = str(block.attrs.size, "medium");
  const h = size === "small" ? "h-4" : size === "large" ? "h-16" : "h-8";
  return <div className={h} aria-hidden />;
}

function renderBlock(block: Block, ctx: PreviewContext) {
  switch (block.type) {
    case "navbar":
      return <Navbar block={block} ctx={ctx} />;
    case "announcement":
      return <Announcement block={block} ctx={ctx} />;
    case "banner":
      return <Banner block={block} />;
    case "hero":
      return <Hero block={block} ctx={ctx} />;
    case "features":
      return <Features block={block} />;
    case "categories":
      return <Categories block={block} ctx={ctx} />;
    case "image-banner":
      return <ImageBanner block={block} ctx={ctx} />;
    case "image-with-text":
      return <ImageWithText block={block} ctx={ctx} />;
    case "richtext":
      return <RichText block={block} ctx={ctx} />;
    case "featured":
      return <Featured block={block} ctx={ctx} />;
    case "product-grid":
      return <ProductGrid block={block} ctx={ctx} />;
    case "brands":
      return <Brands block={block} />;
    case "testimonials":
      return <Testimonials block={block} ctx={ctx} />;
    case "faq":
      return <Faq block={block} />;
    case "newsletter":
      return <Newsletter block={block} ctx={ctx} />;
    case "spacer":
      return <Spacer block={block} />;
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
