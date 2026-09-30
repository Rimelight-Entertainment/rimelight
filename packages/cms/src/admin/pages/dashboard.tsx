import { type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";

export interface DashboardPageProps {
  basePath?: string | undefined;
}

/**
 * CMS admin overview (Solid).
 */
export const DashboardPage: Component<DashboardPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";

  return (
    <CMSDashboardLayout
      title="CMS Admin"
      description="Content Management System administration"
      activeSection="dashboard"
      basePath={base()}
      toolbarRight={
        <RLButton href={`${base()}/templates/new`} variant="solid" color="primary" size="sm">
          Create Template
        </RLButton>
      }
    >
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <RLCard title="Pages" description="Create and edit pages">
          <div class="mt-4">
            <RLButton href={`${base()}/pages`} variant="ghost" color="primary">
              Manage Pages
            </RLButton>
          </div>
        </RLCard>
        <RLCard title="Categories & Tags" description="Organize your content structure">
          <div class="mt-4 flex gap-2">
            <RLButton href={`${base()}/categories`} variant="ghost" color="primary">
              Categories
            </RLButton>
            <RLButton href={`${base()}/tags`} variant="ghost" color="primary">
              Tags
            </RLButton>
          </div>
        </RLCard>
        <RLCard title="Bylines" description="Manage author attribution">
          <div class="mt-4">
            <RLButton href={`${base()}/bylines`} variant="ghost" color="primary">
              Manage Bylines
            </RLButton>
          </div>
        </RLCard>
      </div>

      <RLCard title="Quick Actions">
        <div class="flex flex-wrap gap-4 mt-2">
          <RLButton href={`${base()}/pages/new`} variant="solid" color="primary">
            Create Page
          </RLButton>
          <RLButton href={`${base()}/templates/new`} variant="outline" color="neutral">
            Create Template
          </RLButton>
        </div>
      </RLCard>
    </CMSDashboardLayout>
  );
};

export default DashboardPage;
