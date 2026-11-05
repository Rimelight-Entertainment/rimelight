import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { ThemeColor } from "../../types";
import type { RLErrorAction, RLErrorProps } from "./error.types";
import { RLErrorTheme } from "./error.theme";
import { getErrorStatus, isDevEnvironment, isHttpError } from "./http-error";
import { uiT } from "../../locale";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";

interface StatusStyle {
  icon: string;
  color: ThemeColor;
}

const STATUS_STYLES: Record<number, StatusStyle> = {
  400: { icon: "i-lucide-circle-alert", color: "warning" },
  401: { icon: "i-lucide-lock", color: "warning" },
  403: { icon: "i-lucide-shield-alert", color: "error" },
  404: { icon: "i-lucide-file-question", color: "primary" },
  408: { icon: "i-lucide-clock", color: "warning" },
  429: { icon: "i-lucide-gauge", color: "warning" },
  500: { icon: "i-lucide-server-crash", color: "error" },
  503: { icon: "i-lucide-server-off", color: "error" },
};

const CLIENT_STYLE: StatusStyle = { icon: "i-lucide-circle-alert", color: "warning" };

const styleFor = (status: number): StatusStyle =>
  STATUS_STYLES[status] ?? (status < 500 ? CLIENT_STYLE : STATUS_STYLES[500]!);

/** Built-in text for a status, falling back to the generic client/server text. */
const statusText = (kind: "titles" | "descriptions", status: number): string => {
  const key = `error.${kind}.${status}`;
  const text = uiT(key);
  return text !== key ? text : uiT(`error.${kind}.${status < 500 ? "client" : "server"}`);
};

function errorDetails(error: unknown): string {
  if (error instanceof Error) return error.stack || `${error.name}: ${error.message}`;
  try {
    return typeof error === "string" ? error : JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

const OMIT_KEYS = [
  "status",
  "error",
  "title",
  "description",
  "icon",
  "color",
  "hideStatus",
  "actions",
  "showDetails",
] as const;

/**
 * Generic error page/card. One layout for every status; only the text, icon,
 * color and actions change. Pair it with `RLErrorBoundary` to catch render errors.
 */
export const RLError: Component<RLErrorProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLErrorTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["iconSlot", "actionsSlot", "footerSlot"] as const,
    variants: () => ({
      color: props.color ?? styleFor(props.status ?? getErrorStatus(props.error)).color,
    }),
  });

  const status = () => props.status ?? getErrorStatus(props.error);
  const style = () => styleFor(status());

  const title = () => {
    const explicit = props.title;
    if (explicit !== undefined) return explicit;
    const err = props.error;
    if (isHttpError(err)) return err.title;
    return statusText("titles", status());
  };

  const description = () => {
    const explicit = props.description;
    if (explicit !== undefined) return explicit;
    const err = props.error;
    if (isHttpError(err) && err.expose && err.message) return err.message;
    return statusText("descriptions", status());
  };

  const showDetails = () =>
    (props.showDetails ?? isDevEnvironment()) && props.error !== undefined && props.error !== null;

  const actionList = (): RLErrorAction[] =>
    props.actions ?? [{ label: uiT("error.home"), href: "/", icon: "i-lucide-house" }];

  const statusLabel = () => `${uiT("error.status")} ${status()}`;

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <div class={classes().card} data-slot="card" role="alert">
        <Show when={!props.hideStatus}>
          <div class={classes().badge} data-slot="badge">
            <span class={classes().dot} data-slot="dot" aria-hidden="true" />
            <span class={classes().badgeLabel} data-slot="badge-label">
              {statusLabel()}
            </span>
          </div>
        </Show>

        <Show
          when={slots.iconSlot()}
          fallback={
            <div class={classes().icon} data-slot="icon">
              <RLIcon name={props.icon ?? style().icon} class="size-8" aria-hidden="true" />
            </div>
          }
        >
          {slots.iconSlot()}
        </Show>

        <div class={classes().header} data-slot="header">
          <h1 class={classes().title} data-slot="title">
            {title()}
          </h1>
          <Show when={description()}>
            <p class={classes().description} data-slot="description">
              {description()}
            </p>
          </Show>
        </div>

        <Show when={children()}>
          <div class={classes().body} data-slot="body">
            {children()}
          </div>
        </Show>

        <Show when={showDetails()}>
          <details class={classes().details} data-slot="details">
            <summary>{uiT("error.details")}</summary>
            <pre>{errorDetails(props.error)}</pre>
          </details>
        </Show>

        <Show
          when={slots.actionsSlot()}
          fallback={
            <Show when={actionList().length > 0}>
              <div class={classes().actions} data-slot="actions">
                <For each={actionList()}>
                  {(action) => {
                    const { icon, label, color, variant, href, onClick, class: cls } = action;
                    return (
                      <RLButton
                        variant={variant}
                        color={color}
                        href={href}
                        onClick={onClick}
                        {...(icon ? { leadingIcon: icon } : {})}
                        class={`w-full justify-center py-2.5 font-semibold ${cls ?? ""}`}
                      >
                        {label}
                      </RLButton>
                    );
                  }}
                </For>
              </div>
            </Show>
          }
        >
          <div class={classes().actions} data-slot="actions">
            {slots.actionsSlot()}
          </div>
        </Show>

        <Show when={slots.footerSlot()}>
          <div class={classes().footer} data-slot="footer">
            {slots.footerSlot()}
          </div>
        </Show>
      </div>
    </Tag>
  );
};
