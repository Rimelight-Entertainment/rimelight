import type { Component } from "solid-js";
import { Errored, createEffect, untrack } from "solid-js";
import type { RLErrorBoundaryProps } from "./error-boundary.types";
import { RLErrorBoundaryTheme } from "./error-boundary.theme";
import type { RLErrorAction } from "../error/error.types";
import { RLError } from "../error/RLError";
import { getErrorStatus } from "../error/http-error";
import { uiT } from "../../locale";

/**
 * Catches errors thrown below it and renders `RLError` (or a custom `fallbackSlot`).
 * 5xx errors get a "Try again" button wired to Solid's `reset`.
 * In production, unexpected error messages are never shown; see `HttpError` to expose one.
 */
export const RLErrorBoundary: Component<RLErrorBoundaryProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLErrorBoundaryTheme.setup(props, {
    slots: [
      "fallbackSlot",
      "resetKey",
      "onError",
      "errorProps",
      "retryLabel",
      "homeLabel",
      "homeHref",
    ] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Errored
        fallback={(err, reset) => {
          const error = untrack(err);
          untrack(() => {
            const report = slots.onError();
            if (report) report(error);
            else console.error(error);
          });

          // Clear the error when resetKey changes (e.g. the route pathname), so navigating
          // away from a broken page doesn't keep showing its error.
          const initialKey = untrack(() => slots.resetKey());
          createEffect(
            () => slots.resetKey(),
            (key) => {
              if (key !== initialKey) reset();
            },
          );

          const fallback = slots.fallbackSlot();
          if (fallback !== undefined) {
            const context = { error, reset };
            return typeof fallback === "function" ? fallback(context) : fallback;
          }

          const actions = (): RLErrorAction[] => {
            const home: RLErrorAction = {
              label: slots.homeLabel() ?? uiT("error.home"),
              href: slots.homeHref() ?? "/",
              icon: "i-lucide-house",
            };
            if (getErrorStatus(error) < 500) return [home];
            return [
              {
                label: slots.retryLabel() ?? uiT("error.retry"),
                icon: "i-lucide-rotate-ccw",
                onClick: () => reset(),
              },
              { ...home, variant: "outline", color: "neutral" },
            ];
          };

          const errorProps = slots.errorProps() ?? {};
          return <RLError actions={actions()} theme={theme()} {...errorProps} error={error} />;
        }}
      >
        {children()}
      </Errored>
    </Tag>
  );
};
