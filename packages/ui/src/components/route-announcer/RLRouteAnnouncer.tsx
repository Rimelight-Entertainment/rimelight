import type { Component } from "solid-js";
import type { RouteAnnouncerProgressOptions, RLRouteAnnouncerProps } from "./route-announcer.types";
import { RLRouteAnnouncerTheme } from "./route-announcer.theme";
import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { useInRouter, useIsRouting, useLocation } from "@solidjs/router";
import { uiT } from "../../locale";

const OMIT_KEYS = ["color", "size", "prefix", "progress"] as const;

export const RLRouteAnnouncer: Component<RLRouteAnnouncerProps> = (props) => {
  const inRouter = useInRouter();
  const location = inRouter ? useLocation() : undefined;
  const isRouting = inRouter ? useIsRouting() : () => false;

  const [announcement, setAnnouncement] = createSignal("");

  const progressOptions = createMemo<RouteAnnouncerProgressOptions | undefined>(() =>
    typeof props.progress === "object" ? props.progress : undefined,
  );

  const { Tag, classes, rest, theme, children, ui } = RLRouteAnnouncerTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({
      color: progressOptions()?.color ?? props.color,
      size: progressOptions()?.size ?? props.size,
    }),
  });

  createEffect(
    () => location?.pathname,
    (pathname) => {
      const prefix = props.prefix ?? uiT("route-announcer.prefix");
      setAnnouncement(document.title || `${prefix} ${pathname ?? ""}`.trim());
    },
  );

  const progressClasses = RLRouteAnnouncerTheme.use(props, () => ({
    color: progressOptions()?.color ?? props.color,
    size: progressOptions()?.size ?? props.size,
    ui: { ...ui(), progressBar: [ui()?.progressBar, progressOptions()?.class] },
  }));

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
      <Show when={props.progress !== false && isRouting()}>
        <div
          role="progressbar"
          aria-label={uiT("route-announcer.loading")}
          aria-valuemin={0}
          aria-valuemax={100}
          class={progressClasses().progressBar}
          data-slot="progress-bar"
        >
          <div class={classes().progressIndicator} data-slot="progress-indicator" />
        </div>
      </Show>

      {children()}
    </Tag>
  );
};
