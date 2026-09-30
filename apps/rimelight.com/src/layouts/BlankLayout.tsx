import { type Component, Show } from "solid-js";
import { useParams } from "@solidjs/router";
import type { JSX } from "@solidjs/web";
import { Title, Meta } from "@solidjs/meta";
import { RLMain } from "@rimelight/ui";
import { currentLocale } from "@rimelight/i18n";

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
    currentLocale.set(params.locale);
  }

  return (
    <>
      <Show when={props.title}>
        <Title>{props.title}</Title>
      </Show>
      <Show when={props.description}>
        <Meta name="description" content={props.description} />
      </Show>
      <Show when={props.noindex}>
        <Meta name="robots" content="noindex, nofollow" />
      </Show>

      <RLMain id="main-content" class="min-h-screen">
        {props.children}
      </RLMain>
    </>
  );
};

export default BlankLayout;
