import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";
import { RLMain } from "@rimelight/ui/components/main/RLMain.tsx";

export const BlankRouteLayout: Component<RouteSectionProps> = (props) => {
  return <RLMain>{props.children}</RLMain>;
};

export default BlankRouteLayout;
