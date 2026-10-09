import { For, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { useCmsApi } from "./_shared";

export interface TemplatesIndexPageProps {
  basePath?: string | undefined;
  apiBase?: string | undefined;
  initialTemplates?: any[];
}

export const TemplatesIndexPage: Component<TemplatesIndexPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const remote = useCmsApi<{ templates: any[] }>(() =>
    props.initialTemplates ? null : `${apiBase()}/templates`,
  );
  const templates = () => props.initialTemplates ?? remote.data()?.templates ?? [];

  const remove = async (id: string) => {
    await fetch(`${apiBase()}/templates/${id}`, { method: "DELETE" });
    await remote.refetch();
  };

  return (
    <CMSDashboardLayout
      title="Templates"
      description="Reusable page templates and starter scaffolds"
      activeSection="templates"
      basePath={base()}
      toolbarRight={
        <div class="flex gap-2">
          <RLButton href={`${base()}/pages`} variant="outline" color="neutral" size="sm">
            Pages
          </RLButton>
          <RLButton href={`${base()}/templates/new`} variant="solid" color="primary" size="sm">
            Create Template
          </RLButton>
        </div>
      }
    >
      <Show when={remote.loading() && !props.initialTemplates}>
        <p class="text-sm text-muted">Loading templates…</p>
      </Show>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <For each={templates()}>
          {(t) => (
            <div class="border border-default rounded-lg bg-default p-6 flex flex-col justify-between">
              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between">
                  <h3 class="font-semibold text-highlighted text-base">
                    {t.title ?? t.slug ?? t.id}
                  </h3>
                  <RLBadge variant="soft" color="neutral" size="xs">
                    v{t.version ?? 1}
                  </RLBadge>
                </div>
                <Show when={t.description}>
                  <p class="text-sm text-muted">{t.description}</p>
                </Show>
                <span class="font-mono text-xs text-muted">/{t.slug}</span>
              </div>
              <div class="flex items-center gap-2 mt-6 pt-4 border-t border-default/50">
                <RLButton href={`${base()}/templates/${t.id}/edit`} variant="ghost" size="xs">
                  Edit
                </RLButton>
                <RLButton variant="ghost" size="xs" onClick={() => void remove(t.id)}>
                  Delete
                </RLButton>
              </div>
            </div>
          )}
        </For>
      </div>
    </CMSDashboardLayout>
  );
};
