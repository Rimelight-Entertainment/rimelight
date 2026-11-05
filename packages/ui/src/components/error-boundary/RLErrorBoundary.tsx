import type { Component } from "solid-js";
import { Errored, createEffect, untrack } from "solid-js";
import type { RLErrorBoundaryProps } from "./error-boundary.types";
import { RLErrorBoundaryTheme } from "./error-boundary.theme";
import type { ErrorAction } from "../error/error.types";
import { RLError } from "../error/RLError";
import { getErrorStatus } from "../error/http-error";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "resetKey",
  "onError",
  "errorProps",
  "retryLabel",
  "homeLabel",
  "homeHref",
] as const;

/**
 * Catches errors thrown below it and renders `RLError` (or a custom `fallbackSlot`).
 * 5xx errors get a "Try again" button wired to Solid's `reset`.
 * In production, unexpected error messages are never shown; see `HttpError` to expose one.
 */
export const RLErrorBoundary: Component<RLErrorBoundaryProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLErrorBoundaryTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["fallbackSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Errored
        fallback={(err, reset) => {
          const error = untrack(err);
          untrack(() => {
            const report = props.onError;
            if (report) report(error);
            else console.error(error);
          });

          // Clear the error when resetKey changes (e.g. the route pathname), so navigating
          // away from a broken page doesn't keep showing its error.
          const initialKey = untrack(() => props.resetKey);
          createEffect(
            () => props.resetKey,
            (key) => {
              if (key !== initialKey) reset();
            },
          );

          const fallback = slots.fallbackSlot();
          if (fallback !== undefined) {
            const context = { error, reset };
            return typeof fallback === "function" ? fallback(context) : fallback;
          }

          const actions = (): ErrorAction[] => {
            const home: ErrorAction = {
              label: props.homeLabel ?? uiT("error.home"),
              href: props.homeHref ?? "/",
              icon: "i-lucide-house",
            };
            if (getErrorStatus(error) < 500) return [home];
            return [
              {
                label: props.retryLabel ?? uiT("error.retry"),
                icon: "i-lucide-rotate-ccw",
                onClick: () => reset(),
              },
              { ...home, variant: "outline", color: "neutral" },
            ];
          };

          const errorProps = props.errorProps ?? {};
          return <RLError actions={actions()} theme={theme()} {...errorProps} error={error} />;
        }}
      >
        {children()}
      </Errored>
    </Tag>
  );
};
