import { Show, createSignal, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLModal } from "@rimelight/ui/components/modal/RLModal.tsx";
import { RLEmpty } from "@rimelight/ui/components/empty/RLEmpty.tsx";
import { RLFormField } from "@rimelight/ui/components/form-field/RLFormField.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { cmsT } from "../locale";

/** Small, dependency-free primitives so every dashboard view looks and behaves the same. */

export const PageHeader: Component<{
  title: JSX.Element;
  description?: JSX.Element;
  actions?: JSX.Element;
  icon?: string;
}> = (props) => (
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
const buttonStyle: Record<
  ButtonVariant,
  { variant: "solid" | "outline" | "ghost"; color: "primary" | "neutral" | "error" }
> = {
  primary: { variant: "solid", color: "primary" },
  secondary: { variant: "outline", color: "neutral" },
  ghost: { variant: "ghost", color: "neutral" },
  danger: { variant: "solid", color: "error" },
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
  const style = () => buttonStyle[props.variant ?? "secondary"];
  return (
    <RLButton
      size="sm"
      variant={style().variant}
      color={style().color}
      leadingIcon={props.icon}
      loading={props.loading}
      disabled={props.disabled}
      href={props.href}
      type={props.type ?? "button"}
      title={props.title}
      class={props.class}
      onClick={(e: MouseEvent) => props.onClick?.(e)}
    >
      {props.children}
    </RLButton>
  );
};

export const Modal: Component<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: JSX.Element;
  footer?: JSX.Element;
  wide?: boolean;
}> = (props) => (
  <RLModal
    open={props.open}
    title={props.title}
    onOpenChange={(next: boolean) => {
      if (!next) props.onClose();
    }}
    footer={props.footer}
    ui={{ content: props.wide ? "max-w-4xl" : "max-w-lg" }}
  >
    {props.children}
  </RLModal>
);

export const Empty: Component<{
  icon?: string;
  title: string;
  description?: string;
  action?: JSX.Element;
}> = (props) => (
  <RLEmpty
    icon={props.icon ?? "i-lucide-inbox"}
    title={props.title}
    {...(props.description ? { description: props.description } : {})}
    actionsSlot={props.action}
  />
);

const statusColor: Record<string, "success" | "neutral" | "info" | "error" | "warning"> = {
  published: "success",
  draft: "neutral",
  scheduled: "info",
  archived: "error",
  pending: "warning",
  approved: "success",
  rejected: "error",
};

export const StatusBadge: Component<{ status: string; changed?: boolean }> = (props) => (
  <span class="inline-flex items-center gap-1">
    <RLBadge
      size="sm"
      variant="subtle"
      color={statusColor[props.status] ?? "neutral"}
      label={props.status}
      class="capitalize"
    />
    <Show when={props.changed}>
      <span class="size-1.5 rounded-full bg-warning-500" title={cmsT("text.unpublished-changes")} />
    </Show>
  </span>
);

export const Field: Component<{ label: string; children: JSX.Element; hint?: string }> = (
  props,
) => (
  <RLFormField label={props.label} {...(props.hint ? { description: props.hint } : {})}>
    {props.children}
  </RLFormField>
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
  <Show
    when={!props.when}
    fallback={
      <div class="flex justify-center py-16">
        <span class="i-lucide-loader-circle size-6 animate-spin text-muted" />
      </div>
    }
  >
    {props.children}
  </Show>
);
