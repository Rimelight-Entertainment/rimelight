import type { Component } from "solid-js";
import { createMemo, For, Show } from "solid-js";
import type { ErrorAction, ErrorStatusStyle, RLErrorProps } from "./error.types";
import { RLErrorTheme } from "./error.theme";
import { getErrorStatus, isDevEnvironment, isHttpError } from "./http-error";
import { uiT } from "../../locale";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";

const SERVER_STYLE: ErrorStatusStyle = { icon: "server-crash", color: "error" };

const STATUS_STYLES: Record<number, ErrorStatusStyle> = {
  400: { icon: "circle-alert", color: "warning" },
  401: { icon: "lock", color: "warning" },
  403: { icon: "shield-alert", color: "error" },
  404: { icon: "file-question", color: "primary" },
  408: { icon: "clock", color: "warning" },
  429: { icon: "gauge", color: "warning" },
  500: SERVER_STYLE,
  503: { icon: "server-off", color: "error" },
};

const CLIENT_STYLE: ErrorStatusStyle = { icon: "circle-alert", color: "warning" };

const styleFor = (status: number): ErrorStatusStyle =>
  STATUS_STYLES[status] ?? (status < 500 ? CLIENT_STYLE : SERVER_STYLE);

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
  "hasDetails",
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
    if (isHttpError(err) && err.title) return err.title;
    return statusText("titles", status());
  };

  const description = () => {
    const explicit = props.description;
    if (explicit !== undefined) return explicit;
    const err = props.error;
    if (isHttpError(err) && err.expose && err.message) return err.message;
    return statusText("descriptions", status());
  };

  const hasDetails = () =>
    (props.hasDetails ?? isDevEnvironment()) && props.error !== undefined && props.error !== null;

  const actionItems = createMemo(() =>
    (props.actions ?? [{ label: uiT("error.home"), href: "/", icon: "house" }]).map(
      (action: ErrorAction) => ({ ...action, class: [classes().action, action.class] }),
    ),
  );

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
              <RLIcon
                name={props.icon ?? style().icon}
                class={classes().iconGlyph}
                aria-hidden="true"
              />
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

        <Show when={hasDetails()}>
          <details class={classes().details} data-slot="details">
            <summary>{uiT("error.details")}</summary>
            <pre>{errorDetails(props.error)}</pre>
          </details>
        </Show>

        <Show
          when={slots.actionsSlot()}
          fallback={
            <Show when={actionItems().length > 0}>
              <div class={classes().actions} data-slot="actions">
                <For each={actionItems()}>
                  {(action) => (
                    <RLButton
                      variant={action.variant}
                      color={action.color}
                      href={action.href}
                      onClick={action.onClick}
                      leadingIcon={action.icon}
                      class={action.class}
                    >
                      {action.label}
                    </RLButton>
                  )}
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
