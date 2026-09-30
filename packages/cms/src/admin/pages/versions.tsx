import { For, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { formatDate, useCmsApi } from "./_shared.tsx";

export interface VersionsPageProps {
  basePath?: string | undefined;
  apiBase?: string | undefined;
  initialVersions?: any[];
}

export const VersionsPage: Component<VersionsPageProps> = (props) => {
  const remote = useCmsApi<{ versions: any[] }>(() =>
    props.initialVersions ? null : `${props.apiBase ?? "/api/cms"}/versions`,
  );
  const versions = () => props.initialVersions ?? remote.data()?.versions ?? [];

  return (
    <CMSDashboardLayout
      title="Versions"
      description="Immutable version history and review approvals"
      activeSection="versions"
      basePath={props.basePath ?? "/cms"}
    >
      <Show when={remote.loading() && !props.initialVersions}>
        <p class="text-sm text-muted">Loading versions…</p>
      </Show>
      <div class="border border-default rounded-lg bg-default divide-y divide-default">
        <For each={versions()}>
          {(v) => (
            <div class="p-4 flex items-center justify-between gap-4">
              <div class="min-w-0">
                <p class="text-sm font-medium truncate">
                  {v.pageTitle ?? v.slug ?? v.pageId} — v{v.versionNumber}
                </p>
                <p class="text-xs text-muted">{formatDate(v.createdAt)}</p>
              </div>
              <RLBadge variant="soft" color="neutral" size="xs">
                {v.status ?? "published"}
              </RLBadge>
            </div>
          )}
        </For>
        <Show when={versions().length === 0 && !remote.loading()}>
          <p class="p-6 text-sm text-muted text-center">No versions yet.</p>
        </Show>
      </div>
    </CMSDashboardLayout>
  );
};

export default VersionsPage;
