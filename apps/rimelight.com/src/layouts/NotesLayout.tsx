import type { Component, ParentProps } from "solid-js";
import { useParams } from "@solidjs/router";
import DashboardLayout from "./DashboardLayout";
import { getRelativeLocaleUrl, currentLocale } from "@rimelight/i18n";

export interface NotesLayoutProps extends ParentProps {
  title?: string | undefined;
  activeTab: "notes" | "todos" | "archive" | "trash";
}

export const NotesLayout: Component<NotesLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>();
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    currentLocale.set(params.locale);
  }

  const links = [
    {
      label: "Notes",
      icon: "i-lucide-sticky-note",
      href: getRelativeLocaleUrl("/dashboard/notes"),
      active: props.activeTab === "notes"
    },
    {
      label: "Todos",
      icon: "i-lucide-check-square",
      href: getRelativeLocaleUrl("/dashboard/notes/todos"),
      active: props.activeTab === "todos"
    },
    {
      label: "Archive",
      icon: "i-lucide-archive",
      href: getRelativeLocaleUrl("/dashboard/notes/archive"),
      active: props.activeTab === "archive"
    },
    {
      label: "Trash",
      icon: "i-lucide-trash-2",
      href: getRelativeLocaleUrl("/dashboard/notes/trash"),
      active: props.activeTab === "trash"
    }
  ];

  return (
    <DashboardLayout title={props.title || "Notes"}>
      <div class="p-6 flex flex-col h-full overflow-y-auto">
        <div class="mb-6 flex flex-col gap-1">
          <h1 class="text-2xl font-bold text-neutral-900 flex items-center gap-2">
            <span class="i-lucide-sticky-note text-primary-500" />
            Notes & Tasks
          </h1>
          <p class="text-sm text-neutral-500">
            Keep track of your ideas, todos, and project documents.
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

export default NotesLayout;
