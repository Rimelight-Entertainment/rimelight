import type { Component } from "solid-js";
import { Errored, createEffect, untrack } from "solid-js";
import type { RLErrorBoundaryProps } from "./error-boundary.types";
import type { RLErrorAction } from "../error/error.types";
import { RLError } from "../error/RLError";
import { getErrorStatus } from "../error/http-error";
import { uiT } from "../../locale";
import { slot } from "../../slot";

/**
 * Catches errors thrown below it and renders `RLError` (or a custom `fallback`).
 * 5xx errors get a "Try again" button wired to Solid's `reset`.
 * In production, unexpected error messages are never shown; see `HttpError` to expose one.
 */
export const RLErrorBoundary: Component<RLErrorBoundaryProps> = (props) => {
  const fallbackSlot = slot(() => props.fallbackSlot);

  return (
    <Errored
      fallback={(err, reset) => {
        const error = untrack(err);
        untrack(() => (props.onError ? props.onError(error) : console.error(error)));

        // Clear the error when resetKey changes (e.g. the route pathname), so navigating
        // away from a broken page doesn't keep showing its error.
        const initialKey = untrack(() => props.resetKey);
        createEffect(
          () => props.resetKey,
          (key) => {
            if (key !== initialKey) reset();
          },
        );

        const fallback = fallbackSlot();
        if (fallback) return fallback(error, reset);

        const actions = (): RLErrorAction[] => {
          const home: RLErrorAction = {
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

        return <RLError actions={actions()} {...props.errorProps} error={error} />;
      }}
    >
      {props.children}
    </Errored>
  );
};
