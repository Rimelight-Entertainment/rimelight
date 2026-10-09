import { type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RimelightBylinesManager } from "../../client/components/index";

export interface BylinesPageProps {
  basePath?: string | undefined;
}

export const BylinesPage: Component<BylinesPageProps> = (props) => {
  return (
    <CMSDashboardLayout
      title="Bylines"
      description="Manage author profiles and multi-author attributions"
      activeSection="bylines"
      basePath={props.basePath ?? "/cms"}
    >
      <div class="w-full">
        <RimelightBylinesManager />
      </div>
    </CMSDashboardLayout>
  );
};
