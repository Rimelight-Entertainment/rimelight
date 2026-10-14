import { useLocation } from "@solidjs/router";
import { createSignal, onSettled, type Component } from "solid-js";
import { RLRouteAnnouncerTheme } from "./route-announcer.theme";
import type { RLRouteAnnouncerProps } from "./route-announcer.types";

export const RLRouteAnnouncer: Component<RLRouteAnnouncerProps> = (props) => {
  let location: ReturnType<typeof useLocation> | undefined;
  try {
    location = useLocation();
  } catch {
    // Router context not available (e.g. standalone rendering or test environments)
  }

  const [announcement, setAnnouncement] = createSignal("");

  onSettled(() => {
    if (typeof document === "undefined") return;
    const path = location?.pathname ?? "";
    const prefix = props.prefix ?? "Navigated to";
    const title = document.title ? document.title : `${prefix} ${path}`.trim();
    setAnnouncement(title);
  });

  const slots = () =>
    RLRouteAnnouncerTheme({
      class: props.class,
      ui: props.ui,
    });

  return (
    <div aria-live="polite" aria-atomic="true" role="status" class={slots().root}>
      {announcement()}
    </div>
  );
};

export default RLRouteAnnouncer;
