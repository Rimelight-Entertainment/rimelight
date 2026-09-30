import { type Component } from "solid-js";
import AdminLayout from "#layouts/AdminLayout";

export const AdminTaxonomiesPage: Component = () => {
  return (
    <AdminLayout activeTab="taxonomies" title="Admin Taxonomies">
      <h1>Admin Taxonomies</h1>
    </AdminLayout>
  );
};

export default AdminTaxonomiesPage;
