import { type Component } from "solid-js";
import { useParams } from "@solidjs/router";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLMain } from "@rimelight/ui";
import { setLocale } from "@rimelight/i18n";

export interface BlankLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  noindex?: boolean | undefined;
  favicon?: string | undefined;
  children?: JSX.Element | undefined;
}

export const BlankLayout: Component<BlankLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    setLocale(params.locale);
  }

  useHead(
    () =>
      createSeoHead({
        title: props.title,
        description: props.description,
        noindex: props.noindex,
      }).tags,
  );

  return (
    <>
      <RLMain id="main-content" class="min-h-screen">
        {props.children}
      </RLMain>
    </>
  );
};

export default BlankLayout;
