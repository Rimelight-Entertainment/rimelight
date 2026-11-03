import type { Component } from "solid-js";
import type {
  RLRouteAnnouncerProgressOptions,
  RLRouteAnnouncerProps,
} from "./route-announcer.types";
import { RLRouteAnnouncerTheme } from "./route-announcer.theme";
import { createSignal, onSettled, Show } from "solid-js";
import { useLocation, useIsRouting } from "@solidjs/router";
import { uiT } from "../../locale";

const toProgressOptions = (
  progress: boolean | RLRouteAnnouncerProgressOptions | undefined,
): RLRouteAnnouncerProgressOptions | undefined =>
  typeof progress === "object" && progress !== null ? progress : undefined;

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

  const { Tag, classes, rest, slots, theme } = RLRouteAnnouncerTheme.setup(props, {
    slots: ["prefix", "progress", "color", "size"] as const,
    variants: (s) => {
      const options = toProgressOptions(s.progress());
      return {
        color: options?.color ?? s.color(),
        size: options?.size ?? s.size(),
      };
    },
  });

  onSettled(() => {
    if (typeof document === "undefined") return;
    const path = location?.pathname ?? "";
    const prefix = slots.prefix() ?? uiT("route-announcer.prefix");
    const title = document.title ? document.title : `${prefix} ${path}`.trim();
    setAnnouncement(title);
  });

  const progressEnabled = () => slots.progress() !== false;
  const progressOptions = () => toProgressOptions(slots.progress());

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
