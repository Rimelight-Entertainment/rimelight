import { Show, createSignal, onSettled, type Component, type JSX } from "solid-js";
import { Portal } from "@solidjs/web";
import type { EntryStatus } from "../core/types/pages";

/** Small, dependency-free primitives so every dashboard view looks and behaves the same. */

export const PageHeader: Component<{ title: JSX.Element; description?: JSX.Element; actions?: JSX.Element; icon?: string }> = (props) => (
  <header class="flex flex-wrap items-start justify-between gap-3 border-b border-default px-6 py-4">
    <div class="flex min-w-0 items-start gap-3">
      <Show when={props.icon}>
        <span class={`${props.icon} mt-1 size-5 shrink-0 text-muted`} />
      </Show>
      <div class="min-w-0">
        <h1 class="truncate text-lg font-semibold text-highlighted">{props.title}</h1>
        <Show when={props.description}>
          <p class="mt-0.5 text-sm text-muted">{props.description}</p>
        </Show>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">{props.actions}</div>
  </header>
);

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white hover:bg-primary-600 border-transparent",
  secondary: "border-default bg-default text-highlighted hover:bg-elevated",
  ghost: "border-transparent text-toned hover:bg-elevated hover:text-highlighted",
  danger: "border-transparent bg-error-500 text-white hover:bg-error-600",
};

export const Button: Component<{
  variant?: ButtonVariant;
  icon?: string;
  onClick?: (e: MouseEvent) => void;
  href?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  title?: string;
  class?: string;
  children?: JSX.Element;
}> = (props) => {
  const cls = () =>
    `inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${variants[props.variant ?? "secondary"]} ${props.class ?? ""}`;
  const inner = () => (
    <>
      <Show when={props.loading} fallback={<Show when={props.icon}><span class={`${props.icon} size-4`} /></Show>}>
        <span class="i-lucide-loader-circle size-4 animate-spin" />
      </Show>
      {props.children}
    </>
  );
  return (
    <Show
      when={props.href}
      fallback={
        <button type={props.type ?? "button"} class={cls()} title={props.title} disabled={props.disabled || props.loading} onClick={(e) => props.onClick?.(e)}>
          {inner()}
        </button>
      }
    >
      <a href={props.href} class={cls()} title={props.title}>
        {inner()}
      </a>
    </Show>
  );
};

export const Modal: Component<{ open: boolean; title: string; onClose: () => void; children: JSX.Element; footer?: JSX.Element; wide?: boolean }> = (props) => (
  <Show when={props.open}>
    <Portal>
      <div class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[10vh]" onClick={props.onClose}>
        <div
          role="dialog"
          aria-modal="true"
          class={`w-full ${props.wide ? "max-w-4xl" : "max-w-lg"} rounded-xl border border-default bg-default shadow-2xl`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.key === "Escape" && props.onClose()}
        >
          <div class="flex items-center justify-between border-b border-default px-5 py-3">
            <h2 class="font-semibold text-highlighted">{props.title}</h2>
            <button type="button" aria-label="Close" class="i-lucide-x size-4 text-muted hover:text-highlighted" onClick={props.onClose} />
          </div>
          <div class="px-5 py-4">{props.children}</div>
          <Show when={props.footer}>
            <div class="flex justify-end gap-2 border-t border-default px-5 py-3">{props.footer}</div>
          </Show>
        </div>
      </div>
    </Portal>
  </Show>
);

export const Empty: Component<{ icon?: string; title: string; description?: string; action?: JSX.Element }> = (props) => (
  <div class="flex flex-col items-center gap-2 rounded-xl border border-dashed border-default px-6 py-14 text-center">
    <span class={`${props.icon ?? "i-lucide-inbox"} size-8 text-muted`} />
    <p class="font-medium text-highlighted">{props.title}</p>
    <Show when={props.description}>
      <p class="max-w-sm text-sm text-muted">{props.description}</p>
    </Show>
    <Show when={props.action}>
      <div class="mt-2">{props.action}</div>
    </Show>
  </div>
);

const statusStyle: Record<string, string> = {
  published: "bg-success-500/10 text-success-600",
  draft: "bg-neutral-500/10 text-toned",
  scheduled: "bg-info-500/10 text-info-600",
  archived: "bg-error-500/10 text-error-600",
  pending: "bg-warning-500/10 text-warning-600",
  approved: "bg-success-500/10 text-success-600",
  rejected: "bg-error-500/10 text-error-600",
};

export const StatusBadge: Component<{ status: EntryStatus | string; changed?: boolean }> = (props) => (
  <span class="inline-flex items-center gap-1">
    <span class={`rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyle[props.status] ?? statusStyle["draft"]}`}>{props.status}</span>
    <Show when={props.changed}>
      <span class="size-1.5 rounded-full bg-warning-500" title="Unpublished changes" />
    </Show>
  </span>
);

export const Field: Component<{ label: string; children: JSX.Element; hint?: string }> = (props) => (
  <label class="flex flex-col gap-1">
    <span class="text-xs font-medium text-toned">{props.label}</span>
    {props.children}
    <Show when={props.hint}>
      <span class="text-[11px] text-muted">{props.hint}</span>
    </Show>
  </label>
);

export function formatDate(value: Date | string | null | undefined, withTime = false): string {
  if (!value) return "—";
  const d = new Date(value);
  return withTime
    ? d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function relativeTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const diff = (Date.now() - new Date(value).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(value);
}

/**
 * Client-side loader: runs `fn` after mount and whenever `reload()` is called. Views render a
 * loading state first on every environment, so there is nothing to hydrate inconsistently.
 */
export function useLoader<T>(fn: () => Promise<T>, onError?: (err: Error) => void) {
  const [data, setData] = createSignal<T | undefined>(undefined);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const reload = async () => {
    setLoading(true);
    try {
      const value = await fn();
      setData(() => value);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
      onError?.(err as Error);
    } finally {
      setLoading(false);
    }
  };
  onSettled(() => {
    void reload();
  });
  return { data, loading, error, reload, mutate: (v: T) => setData(() => v) };
}

export const Loading: Component<{ when: boolean; children: JSX.Element }> = (props) => (
  <Show when={!props.when} fallback={<div class="flex justify-center py-16"><span class="i-lucide-loader-circle size-6 animate-spin text-muted" /></div>}>
    {props.children}
  </Show>
);
