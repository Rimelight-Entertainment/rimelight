import { type Component } from "solid-js"
import AuthAdminDashboardLayout from "#layouts/AuthAdminDashboardLayout"
import { RimelightBylinesManager } from "@rimelight/cms/client/components"

export const BylinesPage: Component = () => {
  return (
    <AuthAdminDashboardLayout
      title="Bylines | Admin Dashboard"
      description="Manage author profiles and multi-author attributions."
      activeNav="bylines"
    >
      <div class="max-w-7xl mx-auto py-4">
        <RimelightBylinesManager />
      </div>
    </AuthAdminDashboardLayout>
  )
}

export default BylinesPage
