import { type Component } from "solid-js"
import AuthAdminDashboardLayout from "#layouts/AuthAdminDashboardLayout"
import { RimelightTaxonomyManager } from "@rimelight/cms/client/components"

export const TaxonomiesPage: Component = () => {
  return (
    <AuthAdminDashboardLayout
      title="Taxonomies & Categories | Admin Dashboard"
      description="Manage categories and tags for content classification."
      activeNav="taxonomies"
    >
      <div class="max-w-6xl mx-auto py-4">
        <RimelightTaxonomyManager initialTaxonomy="category" />
      </div>
    </AuthAdminDashboardLayout>
  )
}

export default TaxonomiesPage
