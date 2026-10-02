import { type Component } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";

export interface OgLayoutProps {
  title?: string;
  description?: string;
  children?: JSX.Element;
}

export const OgLayout: Component<OgLayoutProps> = (props) => {
  useHead(
    () => createSeoHead({ title: props.title, description: props.description, noindex: true }).tags,
  );
  return (
    <>
      <div class="w-full h-full flex items-center justify-center bg-black text-white">
        {props.children}
      </div>
    </>
  );
};

export default OgLayout;
