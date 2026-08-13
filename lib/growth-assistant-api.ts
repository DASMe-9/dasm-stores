import api from "@/lib/api";

export type GrowthAssistantStatus = "available" | "inactive" | "unavailable";
export type GrowthReviewDecision =
  | "approved_for_manual_use"
  | "revision_requested"
  | "rejected";

export type GrowthRecommendation = {
  id: string;
  subject_type?: string | null;
  subject_id?: string | null;
  title: string;
  summary: string;
  confidence: string;
  details: Record<string, unknown>;
  sources: Array<Record<string, unknown>>;
  review_status: string;
  review_note?: string | null;
  created_at?: string | null;
};

export type GrowthAssistantOverview = {
  status: GrowthAssistantStatus;
  reason?: string;
  runtime_enabled: boolean;
  recommendations: GrowthRecommendation[];
  boundaries?: string[];
};

export type GrowthAssistantQuote = {
  provider_key: string;
  estimated_cost_micros: number;
  currency: string;
  idempotency_key: string;
  capability_key: string;
};

export const growthAssistantApi = {
  getOverview: () => api.get<GrowthAssistantOverview>("/my-store/growth-assistant"),
  getQuote: (maximumCostMicros = 50_000) =>
    api.post<{ quote: GrowthAssistantQuote; requires_confirmation: boolean }>(
      "/my-store/growth-assistant/quotes",
      { maximum_cost_micros: maximumCostMicros },
    ),
  run: (quote: GrowthAssistantQuote) =>
    api.post("/my-store/growth-assistant/runs", {
      idempotency_key: quote.idempotency_key,
      maximum_cost_micros: quote.estimated_cost_micros,
    }),
  review: (id: string, decision: GrowthReviewDecision, note?: string) =>
    api.post(`/my-store/growth-assistant/recommendations/${encodeURIComponent(id)}/reviews`, {
      decision,
      note: note?.trim() || null,
    }),
};
