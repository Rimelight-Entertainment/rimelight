import { type Component } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import { RLMain } from "@rimelight/ui/components/main/RLMain.tsx";

export interface BlankLayoutProps {
  title?: string | undefined;
  description?: string | undefined;
  noindex?: boolean | undefined;
  children?: JSX.Element;
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
      <RLMain>{props.children}</RLMain>
    </>
  );
};

export default BlankLayout;
