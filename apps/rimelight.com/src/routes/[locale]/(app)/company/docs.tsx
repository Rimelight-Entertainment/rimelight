import type { Component } from "solid-js";
import type { RouteSectionProps } from "@solidjs/router";

/**
 * Docs layout. Everything (version switcher, sidebar, table of contents) lives in
 * <DocsPage>, which owns its data — no context passing state from pages up to the layout.
 */
export const DocsRouteLayout: Component<RouteSectionProps> = (props) => <>{props.children}</>;

export default DocsRouteLayout;
