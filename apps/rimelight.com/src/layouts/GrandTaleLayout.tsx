import type { Component, ParentProps } from "solid-js";
import { useParams } from "@solidjs/router";
import AppLayout from "./AppLayout";
import GrandTaleHeader from "#components/franchises/grand-tale/GrandTaleHeader";
import { setLocale } from "@rimelight/i18n";

export interface GrandTaleLayoutProps extends ParentProps {
  title?: string | undefined;
  description?: string | undefined;
  favicon?: string | undefined;
}

export const GrandTaleLayout: Component<GrandTaleLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    setLocale(params.locale);
  }

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
