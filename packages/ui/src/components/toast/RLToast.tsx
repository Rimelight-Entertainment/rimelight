import type { RLToastProps } from "./toast.types";
import type { ThemeColor } from "../../types";
import { RLToastTheme } from "./toast.theme";
import { createSignal, onSettled, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const colorIcons: Partial<Record<ThemeColor, string>> = {
  neutral: "bell",
  error: "circle-check",
  success: "circle-check",
  warning: "triangle-alert",
  info: "info",
};

const OMIT_KEYS = [
  "color",
  "title",
  "description",
  "actionLabel",
  "duration",
  "dismissible",
  "onDismiss",
] as const;

export const RLToast: Component<RLToastProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLToastTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["titleSlot", "descriptionSlot", "actionsSlot"] as const,
  });

  const [leaving, setLeaving] = createSignal(false);
  const duration = () => props.duration ?? 6000;
  const isDismissible = () => props.dismissible ?? true;
  const isError = () => props.color === "error";

  let rootRef: HTMLDivElement | undefined;
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let dismissTimerId: ReturnType<typeof setTimeout> | undefined;
  let startTime = 0;
  let remaining = duration();

  const icon = () => colorIcons[props.color ?? "neutral"] ?? "bell";

  const dismiss = () => {
    if (leaving()) return;
    setLeaving(true);
    if (props.onDismiss) {
      clearTimeout(dismissTimerId);
      dismissTimerId = setTimeout(props.onDismiss, 300);
    }
  };

  const startTimer = () => {
    // Non-dismissible toasts (e.g. consent prompts) must never time out.
    if (!isDismissible()) return;
    if (duration() > 0 && remaining > 0 && timerId === undefined) {
      startTime = Date.now();
      timerId = setTimeout(dismiss, remaining);
    }
  };

  const pauseTimer = () => {
    if (timerId !== undefined) {
      clearTimeout(timerId);
      timerId = undefined;
      remaining -= Date.now() - startTime;
    }
  };

  onSettled(() => {
    if (duration() > 0) {
      startTimer();
    }

    return () => {
      clearTimeout(timerId);
      clearTimeout(dismissTimerId);
    };
  });

  return (
    <Tag
      ref={(el: HTMLDivElement) => (rootRef = el)}
      class={`${classes().root} ${isError() ? "error" : ""} ${leaving() ? "opacity-0 translate-y-2 pointer-events-none" : ""}`}
      data-slot="root"
      data-theme={theme()}
      data-toast
      data-duration={duration()}
      data-dismissible={isDismissible().toString()}
      role={isError() ? "alert" : "status"}
      aria-live={isError() ? "assertive" : "polite"}
      aria-atomic="true"
      tabindex="-1"
      onMouseEnter={() => {
        if (duration() > 0) pauseTimer();
      }}
      onMouseLeave={() => {
        if (duration() > 0) startTimer();
      }}
      onFocusIn={() => {
        if (duration() > 0) pauseTimer();
      }}
      onFocusOut={(e: FocusEvent) => {
        if (duration() > 0 && !rootRef?.contains(e.relatedTarget as Node)) {
          startTimer();
        }
      }}
      {...rest}
    >
      <RLIcon name={icon()} class="size-4 shrink-0 mt-0.5" aria-hidden="true" />

      <div class="flex flex-col gap-0.5 flex-1 min-w-0">
        {slots.titleSlot() || props.title ? (
          <div class={classes().title} data-slot="title">
            {slots.titleSlot() ? slots.titleSlot() : props.title}
          </div>
        ) : null}
        {slots.descriptionSlot() || props.description ? (
          <div class={classes().description} data-slot="description">
            {slots.descriptionSlot() ? slots.descriptionSlot() : props.description}
          </div>
        ) : null}
        {children()}
        {slots.actionsSlot() || props.actionLabel ? (
          <div class="flex items-center justify-end gap-2 mt-3" data-slot="actions">
            {slots.actionsSlot() ? (
              slots.actionsSlot()
            ) : (
              <button type="button" class={classes().action} data-slot="action" data-toast-action>
                {props.actionLabel}
              </button>
            )}
          </div>
        ) : null}
      </div>

      <Show when={isDismissible()}>
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
      </Show>
    </Tag>
  );
};
