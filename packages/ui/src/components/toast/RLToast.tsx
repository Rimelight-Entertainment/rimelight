import type { RLToastProps } from "./toast.types";
import { RLToastTheme } from "./toast.theme";
import { createSignal, onSettled, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const variantIcons: Record<string, string> = {
  default: "bell",
  error: "circle-check",
  success: "circle-check",
  warning: "triangle-alert",
  info: "info",
};

const OMIT_KEYS = [
  "title",
  "description",
  "actionLabel",
  "duration",
  "dismissable",
  "onDismiss",
  "titleSlot",
  "descriptionSlot",
  "actionsSlot",
] as const;

export const RLToast: Component<RLToastProps> = (props) => {
  const { Tag, classes, rest } = RLToastTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({
      variant: ["success", "error", "warning", "info"].includes(props.variant ?? "")
        ? props.variant
        : "default",
    }),
  });

  const [leaving, setLeaving] = createSignal(false);
  let rootRef: HTMLDivElement | undefined;
  let timerId: ReturnType<typeof setTimeout> | null = null;
  let dismissTimerId: ReturnType<typeof setTimeout> | undefined;
  let startTime = 0;
  let remaining = props.duration ?? 6000;

  const isError = () => props.variant === "error";

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
    // Non-dismissable toasts (e.g. consent prompts) must never time out.
    if (props.dismissable === false) return;
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
    const duration = props.duration ?? 6000;
    if (duration > 0) {
      startTimer();
    }

    return () => {
      if (timerId !== null) clearTimeout(timerId);
      if (dismissTimerId !== undefined) clearTimeout(dismissTimerId);
    };
  });

  return (
    <Tag
      ref={(el: HTMLDivElement) => (rootRef = el)}
      class={`${classes().root}  ${leaving() ? "opacity-0 translate-y-2 pointer-events-none" : ""}`}
      data-slot="root"
      data-toast
      data-duration={props.duration ?? 6000}
      data-dismissable={(props.dismissable !== false).toString()}
      role={isError() ? "alert" : "status"}
      aria-live={isError() ? "assertive" : "polite"}
      aria-atomic="true"
      tabindex="-1"
      onMouseEnter={() => {
        if ((props.duration ?? 6000) > 0) pauseTimer();
      }}
      onMouseLeave={() => {
        if ((props.duration ?? 6000) > 0) startTimer();
      }}
      onFocusIn={() => {
        if ((props.duration ?? 6000) > 0) pauseTimer();
      }}
      onFocusOut={(e: FocusEvent) => {
        if ((props.duration ?? 6000) > 0 && !rootRef?.contains(e.relatedTarget as Node)) {
          startTimer();
        }
      }}
      {...rest}
    >
      <RLIcon name={icon()} class="size-4 shrink-0 mt-0.5" aria-hidden="true" />

      <div class="flex flex-col gap-0.5 flex-1 min-w-0">
        {props.titleSlot || props.title ? (
          <div class={classes().title} data-slot="title">
            {props.titleSlot ? props.titleSlot : props.title}
          </div>
        ) : null}
        {props.descriptionSlot || props.description ? (
          <div class={classes().description} data-slot="description">
            {props.descriptionSlot ? props.descriptionSlot : props.description}
          </div>
        ) : null}
        {props.children}
        {props.actionsSlot || props.actionLabel ? (
          <div class="flex items-center justify-end gap-2 mt-3" data-slot="actions">
            {props.actionsSlot ? (
              props.actionsSlot
            ) : (
              <button type="button" class={classes().action} data-slot="action" data-toast-action>
                {props.actionLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>

      {props.dismissable !== false && (
        <button
          type="button"
          class={classes().close}
          data-slot="close"
          data-toast-close
          aria-label={uiT("toast.dismiss")}
          onClick={dismiss}
        >
          <RLIcon name="x" class="size-3.5" aria-hidden="true" />
        </button>
      )}
    </Tag>
  );
};
