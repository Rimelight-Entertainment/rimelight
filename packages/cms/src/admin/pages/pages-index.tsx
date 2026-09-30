import { createSignal, For, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { getLocalized, useCmsApi } from "./_shared.tsx";

export interface CmsPageListItem {
  id: string;
  slug: string;
  type: string;
  title: unknown;
  description?: unknown;
  publishedVersionId?: string | null;
  postedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface PagesIndexPageProps {
  basePath?: string | undefined;
  apiBase?: string | undefined;
  locale?: string | undefined;
  initialPages?: CmsPageListItem[] | undefined;
}

export const PagesIndexPage: Component<PagesIndexPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const locale = () => props.locale ?? "en";
  const [confirmDelete, setConfirmDelete] = createSignal<string | null>(null);

  const remote = useCmsApi<{ pages: CmsPageListItem[] }>(() =>
    props.initialPages ? null : `${apiBase()}/pages`,
  );
  const pages = () => props.initialPages ?? remote.data()?.pages ?? [];

  const statusOf = (p: CmsPageListItem) => (p.publishedVersionId ? "published" : "draft");

  const unpublish = async (id: string) => {
    await fetch(`${apiBase()}/pages/${id}/unpublish`, { method: "POST" });
    await remote.refetch();
  };

  const remove = async (id: string) => {
    await fetch(`${apiBase()}/pages/${id}`, { method: "DELETE" });
    setConfirmDelete(null);
    await remote.refetch();
  };

  return (
    <CMSDashboardLayout
      title="Pages"
      description="Create, edit and publish content pages"
      activeSection="pages"
      basePath={base()}
      toolbarRight={
        <div class="flex gap-2">
          <RLButton href={`${base()}/templates`} variant="outline" color="neutral" size="sm">
            Templates
          </RLButton>
          <RLButton href={`${base()}/pages/new`} variant="solid" color="primary" size="sm">
            Create Page
          </RLButton>
        </div>
      }
    >
      <Show when={remote.loading() && !props.initialPages}>
        <p class="text-sm text-muted">Loading pages…</p>
      </Show>
      <Show when={remote.error()}>
        <p class="text-sm text-error">{remote.error()}</p>
      </Show>

      <div class="border border-default rounded-lg bg-default divide-y divide-default">
        <For each={pages()}>
          {(page) => (
            <div class="p-4 flex items-center justify-between gap-4">
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <a
                    href={`${base()}/pages/${page.id}/edit`}
                    class="font-medium text-highlighted text-sm truncate hover:underline"
                  >
                    {getLocalized(page.title, locale()) || page.slug}
                  </a>
                  <RLBadge
                    variant="soft"
                    color={statusOf(page) === "published" ? "success" : "neutral"}
                    size="xs"
                  >
                    {statusOf(page)}
                  </RLBadge>
                  <span class="font-mono text-xs text-muted">/{page.slug}</span>
                </div>
                <p class="text-xs text-muted mt-0.5">{page.type}</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <RLButton href={`${base()}/pages/${page.id}/edit`} variant="ghost" size="xs">
                  Edit
                </RLButton>
                <RLButton href={`${base()}/pages/${page.id}/preview`} variant="ghost" size="xs">
                  Preview
                </RLButton>
                <RLButton href={`${base()}/pages/${page.id}/review`} variant="ghost" size="xs">
                  Review
                </RLButton>
                <Show when={statusOf(page) === "published"}>
                  <RLButton
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    onClick={() => void unpublish(page.id)}
                  >
                    Unpublish
                  </RLButton>
                </Show>
                <Show
                  when={confirmDelete() === page.id}
                  fallback={
                    <RLButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      onClick={() => setConfirmDelete(page.id)}
                    >
                      Delete
                    </RLButton>
                  }
                >
                  <RLButton
                    variant="solid"
                    color="neutral"
                    size="xs"
                    onClick={() => void remove(page.id)}
                  >
                    Confirm
                  </RLButton>
                </Show>
              </div>
            </div>
          )}
        </For>
        <Show when={pages().length === 0 && !remote.loading()}>
          <p class="p-6 text-sm text-muted text-center">
            No pages yet. Create your first page to get started.
          </p>
        </Show>
      </div>
    </CMSDashboardLayout>
  );
};

export default PagesIndexPage;
