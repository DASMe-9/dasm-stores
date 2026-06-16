import type { NextApiRequest, NextApiResponse } from "next";
import { parseBlocks, serializeBlocks, describeBlocksForPrompt } from "@/lib/themes/blocks";

/**
 * AI block generator (Phase 3). Turns an Arabic natural-language description
 * into editor blocks using Claude Haiku.
 *
 * Security: the model output is run through the SAME parse -> serialize
 * pipeline as hand-written code, so the allowlist + sanitizer apply identically.
 * The model can only ever produce known block types with sanitized attributes —
 * there is no path for it to emit raw HTML/JS into the store. No new trust
 * surface beyond what the manual editor already enforces.
 */

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-haiku-4-5-20251001";
const MAX_PROMPT = 500;

function buildSystemPrompt(): string {
  return [
    "أنت مساعد تصميم لمتاجر داسم. مهمتك تحويل وصف المستخدم إلى بلوكات واجهة متجر.",
    "أخرج فقط وسوم البلوكات، وسماً واحداً في كل سطر، دون أي شرح أو Markdown أو نص إضافي.",
    "استخدم الوسوم والخصائص التالية حصراً (لا تخترع وسوماً أو خصائص أخرى):",
    describeBlocksForPrompt(),
    "قواعد: القيم النصية بالعربية. استخدم {{ store.name }} لاسم المتجر عند الحاجة.",
    "ابدأ عادةً بـ <navbar /> وانتهِ بـ <footer />. لا تضع أكثر من navbar أو footer واحد.",
  ].join("\n");
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method not allowed" });

  const auth = req.headers.authorization?.replace("Bearer ", "");
  if (!auth) return res.status(401).json({ message: "غير مصرح" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: "مساعد الذكاء غير مُفعّل بعد. أضف ANTHROPIC_API_KEY." });
  }

  const prompt = String(req.body?.prompt ?? "").trim();
  if (!prompt) return res.status(422).json({ message: "اكتب وصفاً لما تريد." });
  if (prompt.length > MAX_PROMPT) return res.status(422).json({ message: "الوصف طويل جداً." });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const aiRes = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: buildSystemPrompt(),
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const detail = await aiRes.text().catch(() => "");
      console.error("anthropic error", aiRes.status, detail.slice(0, 300));
      return res.status(502).json({ message: "تعذّر الاتصال بمساعد الذكاء." });
    }

    const data = (await aiRes.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => c.text ?? "")
      .join("\n");

    // Same allowlist + sanitize pipeline as the manual editor.
    const { blocks } = parseBlocks(text);
    if (!blocks.length) {
      return res.status(422).json({ message: "تعذّر توليد بلوكات صالحة من الوصف. حاول صياغة أوضح." });
    }

    return res.status(200).json({ source: serializeBlocks(blocks), count: blocks.length });
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError";
    console.error("generate exception", err);
    return res.status(aborted ? 504 : 500).json({
      message: aborted ? "انتهت مهلة المساعد. حاول ثانية." : "خطأ في توليد التصميم.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
