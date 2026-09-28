import { type Component } from "solid-js"
import AdminLayout from "#layouts/AdminLayout"

export const AdminCategoriesPage: Component = () => {
  return (
    <AdminLayout activeTab="categories" title="Admin Categories">
      <h1>Admin Categories</h1>
    </AdminLayout>
  )
}

export default AdminCategoriesPage
