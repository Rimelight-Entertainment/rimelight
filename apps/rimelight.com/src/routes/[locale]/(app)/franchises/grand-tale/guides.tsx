import type { RouteSectionProps } from "@solidjs/router";
import GuidesSidebar from "#components/franchises/grand-tale/GuidesSidebar";

export default function GuidesRouteLayout(props: RouteSectionProps) {
  return (
    <div class="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
      <aside class="w-full lg:w-64 shrink-0">
        <GuidesSidebar />
      </aside>
      <main class="flex-1 min-w-0">{props.children}</main>
    </div>
  );
}
