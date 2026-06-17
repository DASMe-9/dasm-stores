/**
 * Parser + serializer for the block DSL.
 *
 * Source is a sequence of self-closing declarative tags, one per logical block:
 *
 *   {# comment #}
 *   <navbar logo links="الرئيسية, المنتجات" sticky />
 *   <hero title="{{ store.name }}" cta="تسوّق الآن" style="aurora" />
 *   <product-grid cols="3" sort="newest" />
 *   <footer terms="الشروط والأحكام" />
 *
 * Parsing is pure string→data: it never evaluates anything. Every block is run
 * through validateBlock (allowlist + sanitize) before it reaches the result.
 */

import type { Block, BlockAttrValue, ParseResult } from "./types";
import { BLOCK_SCHEMA, isBlockType, validateBlock } from "./schema";

const TAG_RE = /<([a-zA-Z][a-zA-Z-]*)((?:\s+[a-zA-Z-]+(?:="[^"]*")?)*)\s*\/?>/g;
const ATTR_RE = /([a-zA-Z-]+)(?:="([^"]*)")?/g;
const COMMENT_RE = /\{#[\s\S]*?#\}/g;

function parseAttrs(attrString: string): Record<string, unknown> {
  const attrs: Record<string, unknown> = {};
  let m: RegExpExecArray | null;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(attrString)) !== null) {
    const [, key, value] = m;
    attrs[key] = value === undefined ? true : value; // boolean attr when no value
  }
  return attrs;
}

function lineOfIndex(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

export function parseBlocks(source: string): ParseResult {
  const blocks: Block[] = [];
  const errors: ParseResult["errors"] = [];
  const stripped = source.replace(COMMENT_RE, (c) => " ".repeat(c.length));

  let m: RegExpExecArray | null;
  let counter = 0;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(stripped)) !== null) {
    const [, tag, attrString] = m;
    const line = lineOfIndex(source, m.index);
    if (!isBlockType(tag)) {
      errors.push({ line, message: `وسم غير معروف: <${tag}> — تم تجاهله.` });
      continue;
    }
    const block = validateBlock(tag, parseAttrs(attrString ?? ""), `b${++counter}`);
    if (block) blocks.push(block);
  }

  return { blocks, errors };
}

function serializeAttr(name: string, value: BlockAttrValue): string | null {
  if (typeof value === "boolean") return value ? name : null;
  if (Array.isArray(value)) return value.length ? `${name}="${value.join(", ")}"` : null;
  return `${name}="${value}"`;
}

/** Serialize blocks back to canonical DSL source (used for default template + AI output). */
export function serializeBlocks(blocks: Block[]): string {
  return blocks
    .map((block) => {
      const spec = BLOCK_SCHEMA[block.type];
      const parts = Object.keys(spec.attrs)
        .map((name) => serializeAttr(name, block.attrs[name]))
        .filter(Boolean);
      // preserve the universal hidden flag
      if (block.attrs.hidden === true) parts.push("hidden");
      const attrs = parts.join(" ");
      return attrs ? `<${block.type} ${attrs} />` : `<${block.type} />`;
    })
    .join("\n");
}
