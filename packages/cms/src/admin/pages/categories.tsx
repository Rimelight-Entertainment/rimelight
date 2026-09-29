import { type Component } from "solid-js"
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx"
import { RimelightTaxonomyMasterDetail } from "../../client/components/index.ts"

export interface CategoriesPageProps {
  basePath?: string | undefined
}

export const CategoriesPage: Component<CategoriesPageProps> = (props) => {
  return (
    <CMSDashboardLayout
      title="Categories"
      description="Manage hierarchical categories for content organization"
      activeSection="categories"
      basePath={props.basePath ?? "/cms"}
    >
      <div class="w-full">
        <RimelightTaxonomyMasterDetail
          taxonomy="category"
          title="Categories"
          description="Organize your content into hierarchical topics and sections."
        />
      </div>
    </CMSDashboardLayout>
  )
}

export default CategoriesPage
