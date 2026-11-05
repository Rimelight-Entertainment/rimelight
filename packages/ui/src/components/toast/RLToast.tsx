import type { RLToastProps } from "./toast.types";
import type { ThemeColor } from "../../types";
import { RLToastTheme } from "./toast.theme";
import { createSignal, onSettled, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { renderSlot } from "../../slot";
import { uiT } from "../../locale";

const colorIcons: Partial<Record<ThemeColor, string>> = {
  primary: "bell",
  error: "circle-check",
  success: "circle-check",
  warning: "triangle-alert",
  info: "info",
};

const OMIT_KEYS = [
  "color",
  "title",
  "description",
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
  const hasTitle = () => Boolean(slots.titleSlot() || props.title);
  const hasDescription = () => Boolean(slots.descriptionSlot() || props.description);

  let rootRef: HTMLDivElement | undefined;
  let timerId: number | undefined;
  let dismissTimerId: number | undefined;
  let startTime = 0;
  let remaining = duration();

  const dismiss = () => {
    if (leaving()) return;
    setLeaving(true);
    if (props.onDismiss) {
      clearTimeout(dismissTimerId);
      dismissTimerId = window.setTimeout(props.onDismiss, 300);
    }
  };

  const startTimer = () => {
    // Non-dismissible toasts (e.g. consent prompts) must never time out.
    if (!isDismissible()) return;
    if (duration() > 0 && remaining > 0 && timerId === undefined) {
      startTime = Date.now();
      timerId = window.setTimeout(dismiss, remaining);
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
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-state={leaving() ? "closed" : "open"}
      data-duration={duration()}
      data-dismissible={isDismissible() ? "" : undefined}
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
      <RLIcon name={colorIcons[props.color ?? "primary"] ?? "bell"} class={classes().icon} />

      <div class={classes().body} data-slot="body">
        <Show when={hasTitle()}>
          <div class={classes().title} data-slot="title">
            <Show when={slots.titleSlot()} fallback={props.title}>
              {renderSlot(slots.titleSlot())}
            </Show>
          </div>
        </Show>
        <Show when={hasDescription()}>
          <div class={classes().description} data-slot="description">
            <Show when={slots.descriptionSlot()} fallback={props.description}>
              {renderSlot(slots.descriptionSlot())}
            </Show>
          </div>
        </Show>
        {children()}
        <Show when={slots.actionsSlot()}>
          <div class={classes().actions} data-slot="actions">
            {renderSlot(slots.actionsSlot())}
          </div>
        </Show>
      </div>

      <Show when={isDismissible()}>
        <RLButton
          icon="x"
          variant="ghost"
          size="xs"
          class={classes().close}
          aria-label={uiT("toast.dismiss")}
          onClick={dismiss}
        />
      </Show>
    </Tag>
  );
};
