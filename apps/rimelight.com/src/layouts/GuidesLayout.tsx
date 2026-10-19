import type { Component, ParentProps } from "solid-js";
import AppLayout from "./AppLayout";
import GrandTaleHeader from "#components/franchises/grand-tale/GrandTaleHeader";
import GuidesSidebar from "#components/franchises/grand-tale/GuidesSidebar";

export interface GuidesLayoutProps extends ParentProps {
  title?: string | undefined;
  description?: string | undefined;
  favicon?: string | undefined;
}

export const GuidesLayout: Component<GuidesLayoutProps> = (props) => {
  return (
    <AppLayout
      title={props.title || "Guides | Grand Tale"}
      description={props.description || "Grand Tale Guides"}
      favicon={props.favicon || "https://cdn.rimelight.com/logos/grand-tale.ico"}
    >
      <GrandTaleHeader />
      <div class="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside class="w-full lg:w-64 shrink-0">
          <GuidesSidebar />
        </aside>
        <main class="flex-1 min-w-0">{props.children}</main>
      </div>
    </AppLayout>
  );
};

export default GuidesLayout;
