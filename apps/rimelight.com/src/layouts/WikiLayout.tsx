import type { Component, ParentProps } from "solid-js";
import AppLayout from "./AppLayout";
import GrandTaleHeader from "#components/franchises/grand-tale/GrandTaleHeader";
import WikiSidebar from "#components/franchises/grand-tale/WikiSidebar";

export interface WikiLayoutProps extends ParentProps {
  title?: string | undefined;
  description?: string | undefined;
  favicon?: string | undefined;
}

export const WikiLayout: Component<WikiLayoutProps> = (props) => {
  return (
    <AppLayout
      title={props.title || "Wiki | Grand Tale"}
      description={props.description || "Grand Tale Wiki"}
      favicon={props.favicon || "https://cdn.rimelight.com/logos/grand-tale.ico"}
    >
      <GrandTaleHeader />
      <div
        class="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8"
        style={{ "padding-top": "var(--rl-header-height, 1px)" }}
      >
        <aside class="w-full lg:w-64 shrink-0">
          <WikiSidebar />
        </aside>
        <main class="flex-1 min-w-0">{props.children}</main>
      </div>
    </AppLayout>
  );
};

export default WikiLayout;
