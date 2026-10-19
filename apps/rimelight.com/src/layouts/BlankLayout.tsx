import type { Component } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLMain } from "@rimelight/ui";

export interface BlankLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  noindex?: boolean | undefined;
  favicon?: string | undefined;
  children?: JSX.Element | undefined;
}

export const BlankLayout: Component<BlankLayoutProps> = (props) => {
  useHead(() =>
    createSeoHead({
      title: props.title,
      description: props.description,
      noindex: props.noindex,
    }),
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
