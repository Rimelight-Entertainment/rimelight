import { type Component } from "solid-js"
import AdminLayout from "#layouts/AdminLayout"

export const AdminBylinesPage: Component = () => {
  return (
    <AdminLayout activeTab="bylines" title="Admin Bylines">
      <h1>Admin Bylines</h1>
    </AdminLayout>
  )
}

export default AdminBylinesPage
