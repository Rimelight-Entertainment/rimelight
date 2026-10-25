import type { RouteSectionProps } from "@solidjs/router";

/** Docs layout: a passthrough — DocsPage owns its data (CMS `doc` collection). */
export default function DocsLayout(props: RouteSectionProps) {
  return <>{props.children}</>;
}
