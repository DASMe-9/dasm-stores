"use client";

import { useMemo, useState } from "react";
import { Heart, UserPlus } from "lucide-react";
import type { OwnerPublicProfile, ProfileViewerState, SocialSummary } from "@/lib/api-server";
import { platformApiOrigin } from "@/lib/platform-api-url";

const API_URL = platformApiOrigin();
const PLATFORM_URL = "https://www.dasm.com.sa";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("stores_token") || localStorage.getItem("dasm_token");
}

async function parseJson(res: Response): Promise<Record<string, unknown>> {
  try {
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function apiMessage(body: Record<string, unknown>, fallback: string): string {
  const message = typeof body.message === "string" ? body.message : "";
  if (message.includes("No query results for model")) {
    return "تعذر العثور على ملف صاحب المتجر حالياً. حدث الصفحة ثم حاول مرة أخرى.";
  }
  return message || fallback;
}

export function ProfileFollowButton({
  owner,
  socialSummary,
  viewerState,
  layout = "stacked",
}: {
  owner: OwnerPublicProfile | null;
  socialSummary: SocialSummary | null;
  viewerState: ProfileViewerState | null;
  layout?: "stacked" | "inline";
}) {
  const [followers, setFollowers] = useState(socialSummary?.followers ?? 0);
  const [likes, setLikes] = useState(socialSummary?.likes ?? 0);
  const [isFollowing, setIsFollowing] = useState(Boolean(viewerState?.is_following));
  const [hasReacted, setHasReacted] = useState(Boolean(viewerState?.has_reacted));
  const [loading, setLoading] = useState<"follow" | "like" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const profileHref = useMemo(() => {
    if (!owner) return PLATFORM_URL;
    const path = owner.profile_url || `/profile/${owner.id}`;
    return path.startsWith("http") ? path : `${PLATFORM_URL}${path}`;
  }, [owner]);

  if (!owner) return null;
  const ownerId = owner.id;

  function requireToken(action: string): string | null {
    const token = readToken();
    if (!token) {
      setMessage(`سجّل الدخول أولاً قبل ${action}.`);
      return null;
    }
    return token;
  }

  async function toggleFollow() {
    if (loading) return;
    const token = requireToken("متابعة صاحب المتجر");
    if (!token) return;

    setLoading("follow");
    setMessage(null);
    const next = !isFollowing;

    try {
      const res = await fetch(`${API_URL}/api/public/profiles/${ownerId}/follow`, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const body = await parseJson(res);
      if (!res.ok) throw new Error(apiMessage(body, "تعذر تحديث المتابعة."));

      setIsFollowing(next);
      setFollowers((current) => Math.max(0, current + (next ? 1 : -1)));
      setMessage(next ? "أنت الآن تتابع صاحب هذا المتجر." : "تم إلغاء المتابعة.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحديث المتابعة.");
    } finally {
      setLoading(null);
    }
  }

  async function toggleReaction() {
    if (loading) return;
    const token = requireToken("تسجيل الإعجاب بصاحب المتجر");
    if (!token) return;

    setLoading("like");
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/public/profiles/${ownerId}/reaction`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      });
      const body = await parseJson(res);
      if (!res.ok) throw new Error(apiMessage(body, "تعذر تحديث الإعجاب."));

      const next = Boolean((body.data as { has_reacted?: boolean } | undefined)?.has_reacted ?? !hasReacted);
      setHasReacted(next);
      setLikes((current) => Math.max(0, current + (next ? 1 : -1)));
      setMessage(next ? "تم تسجيل إعجابك بصاحب المتجر." : "تم إلغاء الإعجاب.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تحديث الإعجاب.");
    } finally {
      setLoading(null);
    }
  }

  const inline = layout === "inline";

  return (
    <div className={inline ? "flex flex-wrap items-center gap-2" : "flex flex-col gap-2"}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <a href={profileHref} className="font-bold text-[var(--primary-text,var(--primary))] hover:underline">
          {owner.handle || owner.display_name}
        </a>
        <span>{followers.toLocaleString("ar-SA")} متابع</span>
        <span>{likes.toLocaleString("ar-SA")} إعجاب</span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleFollow}
          disabled={loading === "follow"}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--foreground)] transition hover:bg-[var(--muted)] disabled:opacity-60"
        >
          <UserPlus className="h-4 w-4" />
          {isFollowing ? "تتابعه" : "متابعة"}
        </button>
        <button
          type="button"
          onClick={toggleReaction}
          disabled={loading === "like"}
          className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-bold text-[var(--foreground)] transition hover:bg-[var(--muted)] disabled:opacity-60"
        >
          <Heart className={`h-4 w-4 ${hasReacted ? "fill-current" : ""}`} />
          إعجاب
        </button>
      </div>
      {message ? <p className="text-xs font-semibold text-[var(--muted-foreground)]">{message}</p> : null}
    </div>
  );
}
