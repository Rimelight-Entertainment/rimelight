import { createMemo, createSignal, onSettled, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ToastProps } from "./toast";
import { toastTheme } from "./toast.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLToastProps extends ToastProps {
  onDismiss?: () => void;
  children?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  actionsSlot?: JSX.Element;
}

const variantIcons: Record<string, string> = {
  default: "i-rl-bell",
  error: "i-rl-circleCheck",
  success: "i-rl-circleCheck",
  warning: "i-rl-alertTriangle",
  info: "i-rl-info"
};

const RLToast: Component<RLToastProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "title",
    "description",
    "variant",
    "actionLabel",
    "duration",
    "dismissable",
    "onDismiss",
    "ui",
    "class",
    "children",
    "titleSlot",
    "descriptionSlot",
    "actionsSlot"
  );

  const [leaving, setLeaving] = createSignal(false);
  let rootRef: HTMLDivElement | undefined;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let dismissTimerId: ReturnType<typeof setTimeout> | undefined;
  let startTime = 0;
  let remaining = props.duration ?? 6000;

  const isError = () => props.variant === "error";

  const resolvedClasses = createMemo(() =>
    toastTheme({
      variant: ["success", "error", "warning", "info"].includes(props.variant ?? "")
        ? (props.variant as "success" | "error" | "warning" | "info")
        : "default",
      ui: props.ui,
      class: props.class
    })
  );

  const icon = () => variantIcons[props.variant ?? ""] ?? variantIcons["default"]!;

  const dismiss = () => {
    if (leaving()) return;
    setLeaving(true);
    if (props.onDismiss) {
      if (dismissTimerId !== undefined) clearTimeout(dismissTimerId);
      dismissTimerId = setTimeout(props.onDismiss, 300);
    }
  };

  const startTimer = () => {
    const duration = props.duration ?? 6000;
    if (duration > 0 && remaining > 0 && timerId === null) {
      startTime = Date.now();
      timerId = setTimeout(dismiss, remaining);
    }
  };

  const pauseTimer = () => {
    if (timerId !== null) {
      clearTimeout(timerId);
      timerId = null;
      remaining -= Date.now() - startTime;
    }
  };

  onSettled(() => {
    const root = rootRef;
    if (!root) return;

    const duration = props.duration ?? 6000;
    if (duration > 0) {
      startTimer();
      root.addEventListener("mouseenter", pauseTimer);
      root.addEventListener("mouseleave", startTimer);
      root.addEventListener("focusin", pauseTimer);
      root.addEventListener("focusout", (e) => {
        if (!root.contains(e.relatedTarget as Node)) startTimer();
      });
    }

    return () => {
      if (timerId !== null) clearTimeout(timerId);
      if (dismissTimerId !== undefined) clearTimeout(dismissTimerId);
      root.removeEventListener("mouseenter", pauseTimer);
      root.removeEventListener("mouseleave", startTimer);
      root.removeEventListener("focusin", pauseTimer);
    };
  });

  return (
    <div
      ref={(el) => (rootRef = el)}
      class={`${resolvedClasses().root}  ${leaving() ? "opacity-0 translate-y-2 pointer-events-none" : ""}`}
      data-slot="root"
      data-toast
      data-duration={props.duration ?? 6000}
      data-dismissable={(props.dismissable !== false).toString()}
      role={isError() ? "alert" : "status"}
      aria-live={isError() ? "assertive" : "polite"}
      aria-atomic="true"
      tabindex="-1"
      {...rest}
    >
      <RLIcon name={icon()} class="size-4 shrink-0 mt-0.5" aria-hidden="true" />

      <div class="flex flex-col gap-0.5 flex-1 min-w-0">
        {props.titleSlot || props.title ? (
          <div class={resolvedClasses().title} data-slot="title">
            {props.titleSlot ? props.titleSlot : props.title}
          </div>
        ) : null}
        {props.descriptionSlot || props.description ? (
          <div class={resolvedClasses().description} data-slot="description">
            {props.descriptionSlot ? props.descriptionSlot : props.description}
          </div>
        ) : null}
        {props.children}
        {props.actionsSlot || props.actionLabel ? (
          <div class="flex items-center justify-end gap-2 mt-3" data-slot="actions">
            {props.actionsSlot ? (
              props.actionsSlot
            ) : (
              <button
                type="button"
                class={resolvedClasses().action}
                data-slot="action"
                data-toast-action
              >
                {props.actionLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {props.dismissable !== false && (
        <button
          type="button"
          class={resolvedClasses().close}
          data-slot="close"
          data-toast-close
          aria-label="Dismiss notification"
          onClick={dismiss}
        >
          <RLIcon name="i-rl-close" class="size-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export { RLToast };
