import type { Component } from "solid-js";
import type { RouteAnnouncerProgressOptions, RLRouteAnnouncerProps } from "./route-announcer.types";
import { RLRouteAnnouncerTheme } from "./route-announcer.theme";
import { createSignal, onSettled, Show } from "solid-js";
import { useLocation, useIsRouting } from "@solidjs/router";
import { uiT } from "../../locale";

const toProgressOptions = (
  progress: boolean | RouteAnnouncerProgressOptions | undefined,
): RouteAnnouncerProgressOptions | undefined =>
  typeof progress === "object" && progress !== null ? progress : undefined;

const OMIT_KEYS = ["color", "size", "prefix", "progress"] as const;

export const RLRouteAnnouncer: Component<RLRouteAnnouncerProps> = (props) => {
  let location: ReturnType<typeof useLocation> | undefined;
  let isRouting = () => false;

  try {
    location = useLocation();
  } catch {
    // Router context not available
  }

  try {
    isRouting = useIsRouting();
  } catch {
    // Router context not available
  }

  const [announcement, setAnnouncement] = createSignal("");

  const { Tag, classes, rest, theme } = RLRouteAnnouncerTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => {
      const options = toProgressOptions(props.progress);
      return {
        color: options?.color ?? props.color,
        size: options?.size ?? props.size,
      };
    },
  });

  onSettled(() => {
    if (typeof document === "undefined") return;
    const path = location?.pathname ?? "";
    const prefix = props.prefix ?? uiT("route-announcer.prefix");
    const title = document.title ? document.title : `${prefix} ${path}`.trim();
    setAnnouncement(title);
  });

  const progressEnabled = () => props.progress !== false;
  const progressOptions = () => toProgressOptions(props.progress);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      {/* 1. Visually-hidden live region for screen readers */}
      <div
        aria-live="polite"
        aria-atomic="true"
        role="status"
        class={classes().announcer}
        data-slot="announcer"
      >
        {announcement()}
      </div>

      {/* 2. Visual indeterminate progress bar during async route transitions */}
      <Show when={progressEnabled() && isRouting()}>
        <div
          role="progressbar"
          aria-label={uiT("route-announcer.loading")}
          aria-valuemin={0}
          aria-valuemax={100}
          class={`${classes().progressBar} ${progressOptions()?.class ?? ""}`.trim()}
          data-slot="progress-bar"
        >
          <div class={classes().progressIndicator} data-slot="progress-indicator" />
        </div>
      </Show>
    </Tag>
  );
};
