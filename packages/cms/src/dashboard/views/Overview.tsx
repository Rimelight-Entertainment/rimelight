import { For, Show, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import { useDashboard } from "../context";
import { Button, PageHeader, StatusBadge, relativeTime, useLoader, Loading } from "../ui";

export const Overview: Component = () => {
  const { api, collections, href, user } = useDashboard();
  const stats = useLoader(() => api.stats());
  const recent = useLoader(() => api.entries.list({ orderBy: "updated", limit: 12 }));

  const count = (slug: string) => {
    const s = stats.data()?.byCollection[slug] ?? {};
    return Object.values(s).reduce((a, b) => a + b, 0);
  };

  return (
    <div>
      <PageHeader
        title={`Welcome${user()?.name ? `, ${user()!.name}` : ""}`}
        description="Everything in your site, in one place."
      />
      <div class="flex flex-col gap-8 p-6">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="Entries" value={stats.data()?.totalEntries} icon="i-lucide-files" />
          <Stat
            label="Awaiting review"
            value={stats.data()?.pendingReviews}
            icon="i-lucide-check-check"
            href={href("/reviews")}
          />
          <Stat label="Scheduled" value={stats.data()?.scheduled} icon="i-lucide-calendar-clock" />
          <Stat
            label="Collections"
            value={collections().length}
            icon="i-lucide-database"
            href={href("/schemas")}
          />
        </div>

        <section>
          <h2 class="mb-3 text-sm font-semibold text-highlighted">Collections</h2>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <For each={collections()}>
              {(c) => (
                <a
                  href={href(`/c/${c.slug}`)}
                  class="group flex items-start gap-3 rounded-xl border border-default p-4 transition-colors hover:border-primary-500/50 hover:bg-elevated"
                >
                  <span class={`${c.icon ?? "i-lucide-box"} mt-0.5 size-5 text-primary-500`} />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between">
                      <span class="font-medium text-highlighted">
                        {resolveLabel(c.labelPlural ?? c.label)}
                      </span>
                      <span class="text-xs text-muted">{count(c.slug)}</span>
                    </div>
                    <Show when={c.description}>
                      <p class="mt-1 line-clamp-2 text-xs text-muted">
                        {resolveLabel(c.description)}
                      </p>
                    </Show>
                  </div>
                </a>
              )}
            </For>
          </div>
        </section>

        <section>
          <h2 class="mb-3 text-sm font-semibold text-highlighted">Recently edited</h2>
          <Loading when={recent.loading() && !recent.data()}>
            <div class="divide-y divide-default overflow-hidden rounded-xl border border-default">
              <For each={recent.data()?.entries ?? []}>
                {(e) => (
                  <a
                    href={href(`/e/${e.id}`)}
                    class="flex items-center gap-3 px-4 py-2.5 hover:bg-elevated"
                  >
                    <span class="min-w-0 flex-1 truncate text-sm text-highlighted">
                      {e.excerptTitle}
                    </span>
                    <span class="hidden text-xs text-muted sm:inline">{e.collection}</span>
                    <StatusBadge status={e.status} changed={e.hasUnpublishedChanges} />
                    <span class="w-20 text-right text-xs text-muted">
                      {relativeTime(e.updatedAt ?? e.createdAt)}
                    </span>
                  </a>
                )}
              </For>
            </div>
          </Loading>
        </section>
        <Show when={!collections().length}>
          <Button href={href("/schemas")} icon="i-lucide-plus" variant="primary">
            Create a collection
          </Button>
        </Show>
      </div>
    </div>
  );
};

const Stat: Component<{ label: string; value: number | undefined; icon: string; href?: string }> = (
  props,
) => (
  <a
    href={props.href}
    class={`flex flex-col gap-2 rounded-xl border border-default p-4 ${props.href ? "hover:bg-elevated" : "pointer-events-none"}`}
  >
    <span class="flex items-center justify-between text-xs font-medium text-muted">
      {props.label}
      <span class={`${props.icon} size-4`} />
    </span>
    <span class="text-2xl font-semibold text-highlighted">{props.value ?? "–"}</span>
  </a>
);
