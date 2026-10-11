import type { Component, ParentProps } from "solid-js";
import { useParams } from "@solidjs/router";
import DashboardLayout from "./DashboardLayout";
import { getLocaleUrl, getLocales, setCurrentLocale } from "@rimelight/i18n";

export interface SettingsLayoutProps extends ParentProps {
  title?: string | undefined;
  activeTab: "general" | "notifications" | "security";
}

export const SettingsLayout: Component<SettingsLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && getLocales().includes(params.locale)) {
    setCurrentLocale(params.locale);
  }

  const links = [
    {
      label: "General",
      icon: "i-lucide-user",
      href: getLocaleUrl("/dashboard/settings"),
      active: props.activeTab === "general",
    },
    {
      label: "Notifications",
      icon: "i-lucide-bell",
      href: getLocaleUrl("/dashboard/settings/notifications"),
      active: props.activeTab === "notifications",
    },
    {
      label: "Security",
      icon: "i-lucide-shield",
      href: getLocaleUrl("/dashboard/settings/security"),
      active: props.activeTab === "security",
    },
  ];

  return (
    <DashboardLayout title={props.title || "Settings"}>
      <div class="p-6 flex flex-col h-full overflow-y-auto">
        <div class="mb-6 flex flex-col gap-1">
          <h1 class="text-2xl font-bold text-neutral-900">Settings</h1>
          <p class="text-sm text-neutral-500">Manage your profile, account, and preferences.</p>
        </div>

        <div class="flex flex-col lg:grid lg:grid-cols-10 lg:gap-8 flex-1">
          <aside class="lg:col-span-2">
            <nav class="flex flex-row lg:flex-col gap-1 border-b lg:border-b-0 lg:border-r border-neutral-200 pb-4 lg:pb-0 lg:pr-4">
              {links.map((link) => (
                <a
                  href={link.href}
                  class={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-neutral-200 text-neutral-900"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
                  }`}
                >
                  <span class={`${link.icon} size-4 shrink-0`} />
                  <span>{link.label}</span>
                </a>
              ))}
            </nav>
          </aside>

          <div class="mt-8 lg:col-span-8 lg:mt-0 max-w-3xl">{props.children}</div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsLayout;
