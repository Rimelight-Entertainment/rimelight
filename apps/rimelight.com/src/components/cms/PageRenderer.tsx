import { type Component } from "solid-js";
import { PageRenderer as CmsPageRenderer } from "@rimelight/cms/solid";
import { rimelightCustomBlocks } from "#components/blocks";

export interface PageRendererProps {
  blocks?: any[];
  locale?: string;
  class?: string;
}

export const PageRenderer: Component<PageRendererProps> = (props) => {
  return (
    <CmsPageRenderer
      blocks={props.blocks || []}
      locale={props.locale}
      class={props.class}
      components={rimelightCustomBlocks}
    />
  );
};

export { BlockRenderer } from "@rimelight/cms/solid";
export default PageRenderer;
