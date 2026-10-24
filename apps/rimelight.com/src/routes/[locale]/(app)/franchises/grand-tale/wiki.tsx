import type { RouteSectionProps } from "@solidjs/router";
import WikiSidebar from "#components/franchises/grand-tale/WikiSidebar";

export default function WikiRouteLayout(props: RouteSectionProps) {
  return (
    <div
      class="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8"
      style={{ "padding-top": "var(--rl-header-height, 1px)" }}
    >
      <aside class="w-full lg:w-64 shrink-0">
        <WikiSidebar />
      </aside>
      <main class="flex-1 min-w-0">{props.children}</main>
    </div>
  );
}
