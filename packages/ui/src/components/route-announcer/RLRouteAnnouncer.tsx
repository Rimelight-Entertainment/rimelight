import { useLocation, useIsRouting } from "@solidjs/router";
import { createSignal, onSettled, Show, type Component } from "solid-js";
import { RLRouteAnnouncerTheme } from "./route-announcer.theme";
import type { RLRouteAnnouncerProps, RLRouteAnnouncerProgressSize } from "./route-announcer.types";

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

  onSettled(() => {
    if (typeof document === "undefined") return;
    const path = location?.pathname ?? "";
    const prefix = props.prefix ?? "Navigated to";
    const title = document.title ? document.title : `${prefix} ${path}`.trim();
    setAnnouncement(title);
  });

  const progressEnabled = () => props.progress !== false;

  const progressOptions = () =>
    typeof props.progress === "object" && props.progress !== null ? props.progress : undefined;

  const resolvedColor = () => progressOptions()?.color ?? props.color ?? "primary";
  const resolvedSize = (): RLRouteAnnouncerProgressSize =>
    progressOptions()?.size ?? props.size ?? "sm";

  const slots = () =>
    RLRouteAnnouncerTheme({
      color: resolvedColor(),
      size: resolvedSize(),
      class: props.class,
      ui: props.ui,
    });

  return (
    <div class={slots().root}>
      {/* 1. Visually-hidden live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" role="status" class={slots().announcer}>
        {announcement()}
      </div>

      {/* 2. Visual indeterminate progress bar during async route transitions */}
      <Show when={progressEnabled() && isRouting()}>
        <div
          role="progressbar"
          aria-label="Page loading"
          aria-valuemin={0}
          aria-valuemax={100}
          class={`${slots().progressBar} ${progressOptions()?.class ?? ""}`.trim()}
        >
          <div class={slots().progressIndicator} />
        </div>
      </Show>
    </div>
  );
};

export default RLRouteAnnouncer;
