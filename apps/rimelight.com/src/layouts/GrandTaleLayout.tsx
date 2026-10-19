import type { Component, ParentProps } from "solid-js";
import AppLayout from "./AppLayout";
import GrandTaleHeader from "#components/franchises/grand-tale/GrandTaleHeader";

export interface GrandTaleLayoutProps extends ParentProps {
  title?: string | undefined;
  description?: string | undefined;
  favicon?: string | undefined;
}

export const GrandTaleLayout: Component<GrandTaleLayoutProps> = (props) => {
  return (
    <AppLayout
      title={props.title || "Grand Tale"}
      description={props.description || "Grand Tale"}
      favicon={props.favicon || "https://cdn.rimelight.com/logos/grand-tale.ico"}
    >
      <GrandTaleHeader />
      <div class="bg-grand-tale-primary-900 min-h-screen">{props.children}</div>
    </AppLayout>
  );
};

export default GrandTaleLayout;
