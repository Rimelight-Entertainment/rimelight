import { type Component } from "solid-js";
import AdminLayout from "#layouts/AdminLayout";

export const AdminTagsPage: Component = () => {
  return (
    <AdminLayout activeTab="tags" title="Admin Tags">
      <h1>Admin Tags</h1>
    </AdminLayout>
  );
};

export default AdminTagsPage;
