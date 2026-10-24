import type { RouteSectionProps } from "@solidjs/router";
import type { Component } from "solid-js";

export const OgRouteLayout: Component<RouteSectionProps> = (props) => {
  return (
    <div class="w-full h-full flex items-center justify-center bg-black text-white">
      {props.children}
    </div>
  );
};

export default OgRouteLayout;
