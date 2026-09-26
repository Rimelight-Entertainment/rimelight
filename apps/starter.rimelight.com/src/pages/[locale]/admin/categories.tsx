import { type Component } from "solid-js"
import AuthAdminDashboardLayout from "#layouts/AuthAdminDashboardLayout"
import { RimelightTaxonomyMasterDetail } from "@rimelight/cms/client/components"

export const CategoriesPage: Component = () => {
  return (
    <AuthAdminDashboardLayout
      title="Categories | Admin Dashboard"
      description="Manage hierarchical categories for content organization."
      activeNav="categories"
    >
      <div class="max-w-7xl mx-auto py-4">
        <RimelightTaxonomyMasterDetail
          taxonomy="category"
          title="Categories"
          description="Organize your content into hierarchical topics and sections."
        />
      </div>
    </AuthAdminDashboardLayout>
  )
}

export default CategoriesPage
