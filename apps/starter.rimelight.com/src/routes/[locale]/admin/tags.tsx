import { type Component } from "solid-js"
import AuthAdminDashboardLayout from "#layouts/AuthAdminDashboardLayout"
import { RimelightTaxonomyMasterDetail } from "@rimelight/cms/client/components"

export const TagsPage: Component = () => {
  return (
    <AuthAdminDashboardLayout
      title="Tags | Admin Dashboard"
      description="Manage content tags and keywords."
      activeNav="tags"
    >
      <div class="max-w-7xl mx-auto py-4">
        <RimelightTaxonomyMasterDetail
          taxonomy="tag"
          title="Tags"
          description="Label articles and posts with keywords for easy filtering."
        />
      </div>
    </AuthAdminDashboardLayout>
  )
}

export default TagsPage
