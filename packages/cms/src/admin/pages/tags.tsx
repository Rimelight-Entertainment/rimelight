import { type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RimelightTaxonomyMasterDetail } from "../../client/components/index";

export interface TagsPageProps {
  basePath?: string | undefined;
}

export const TagsPage: Component<TagsPageProps> = (props) => {
  return (
    <CMSDashboardLayout
      title="Tags"
      description="Manage content tags and keywords"
      activeSection="tags"
      basePath={props.basePath ?? "/cms"}
    >
      <div class="w-full">
        <RimelightTaxonomyMasterDetail
          taxonomy="tag"
          title="Tags"
          description="Label articles and posts with keywords for easy filtering."
        />
      </div>
    </CMSDashboardLayout>
  );
};
