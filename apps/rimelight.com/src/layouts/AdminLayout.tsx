import type { Component, ParentProps } from "solid-js";
import { useParams } from "@solidjs/router";
import DashboardLayout from "./DashboardLayout";
import { getLocaleUrl, setCurrentLocale } from "@rimelight/i18n";

export interface AdminLayoutProps extends ParentProps {
  title?: string | undefined;
  activeTab: "overview" | "categories" | "tags" | "bylines" | "taxonomies";
  favicon?: string | undefined;
}

export const AdminLayout: Component<AdminLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    setCurrentLocale(params.locale);
  }

  const links = [
    {
      label: "Overview",
      icon: "i-lucide-layout-dashboard",
      href: getLocaleUrl("/admin"),
      active: props.activeTab === "overview",
    },
    {
      label: "Categories",
      icon: "i-lucide-folder",
      href: getLocaleUrl("/admin/categories"),
      active: props.activeTab === "categories",
    },
    {
      label: "Tags",
      icon: "i-lucide-tag",
      href: getLocaleUrl("/admin/tags"),
      active: props.activeTab === "tags",
    },
    {
      label: "Bylines",
      icon: "i-lucide-pen-tool",
      href: getLocaleUrl("/admin/bylines"),
      active: props.activeTab === "bylines",
    },
    {
      label: "CMS Dashboard",
      icon: "i-lucide-file-text",
      href: getLocaleUrl("/cms"),
      active: false,
    },
  ];

  return (
    <DashboardLayout title={props.title || "Admin Panel"} favicon={props.favicon}>
      <div class="p-6 flex flex-col h-full overflow-y-auto">
        <div class="mb-6 flex flex-col gap-1">
          <h1 class="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <span class="i-lucide-shield-check text-primary-500" />
            Admin Panel
          </h1>
          <p class="text-sm text-neutral-500">
            Manage workspace, teams, users, and global settings.
          </p>
        </div>

        <div class="border-b border-neutral-200 mb-6">
          <nav class="flex gap-4">
            {links.map((link) => (
              <a
                href={link.href}
                class={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors ${
                  link.active
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-neutral-600 hover:text-neutral-900"
                }`}
              >
                <span class={`${link.icon} size-4`} />
                <span>{link.label}</span>
              </a>
            ))}
          </nav>
        </div>

        <div class="flex-1">{props.children}</div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLayout;
