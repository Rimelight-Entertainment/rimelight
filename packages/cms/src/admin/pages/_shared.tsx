import { createSignal, onSettled } from "solid-js";

export function getLocalized(value: unknown, locale = "en"): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    const rec = value as Record<string, string>;
    return rec[locale] ?? rec["en"] ?? "";
  }
  return "";
}

export function parseContent(content: unknown): { blocks: any[]; properties: Record<string, any> } {
  const raw = typeof content === "string" ? JSON.parse(content) : content;
  if (!raw || typeof raw !== "object") return { blocks: [], properties: {} };
  return {
    blocks: Array.isArray((raw as any).blocks) ? (raw as any).blocks : [],
    properties: (raw as any).properties ?? {}
  };
}

export interface ApiState<T> {
  data: () => T | null;
  loading: () => boolean;
  error: () => string | null;
  refetch: () => Promise<void>;
}

/**
 * Minimal GET helper for CMS admin pages (Solid v2: `onSettled`).
 */
export function useCmsApi<T>(url: string | (() => string | null)): ApiState<T> {
  const [data, setData] = createSignal<T | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const load = async () => {
    const resolved = typeof url === "function" ? url() : url;
    if (!resolved) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(resolved);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const payload = (await res.json()) as unknown as T;
      setData(() => payload);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  onSettled(() => {
    void load();
  });

  return { data, loading, error, refetch: load };
}

export function formatDate(value: unknown): string {
  if (!value) return "—";
  try {
    return new Date(value as any).toLocaleDateString();
  } catch {
    return "—";
  }
}
