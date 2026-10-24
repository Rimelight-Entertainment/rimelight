import type { RouteSectionProps } from "@solidjs/router";
import GrandTaleHeader from "#components/franchises/grand-tale/GrandTaleHeader";

export default function GrandTaleRouteLayout(props: RouteSectionProps) {
  return (
    <>
      <GrandTaleHeader />
      <div class="bg-grand-tale-primary-900 min-h-screen">{props.children}</div>
    </>
  );
}
