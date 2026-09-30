import { createSignal, For, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { BlockRenderer } from "../../solid/BlockRenderer.tsx";
import { getLocalized, useCmsApi } from "./_shared.tsx";

export interface PagesReviewPageProps {
  pageId: string;
  basePath?: string | undefined;
  apiBase?: string | undefined;
  locale?: string | undefined;
}

export const PagesReviewPage: Component<PagesReviewPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const locale = () => props.locale ?? "en";
  const [publishing, setPublishing] = createSignal(false);
  const [status, setStatus] = createSignal<string | null>(null);

  const diff = useCmsApi<{ diff: any }>(() => `${apiBase()}/pages/${props.pageId}/diff`);
  const pageData = useCmsApi<{ page: any }>(() => `${apiBase()}/pages/${props.pageId}`);

  const publish = async () => {
    setPublishing(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiBase()}/pages/${props.pageId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changeSummary: "Approved from review" })
      });
      if (!res.ok) throw new Error(`Publish failed (${res.status})`);
      setStatus("Published successfully");
    } catch (e: any) {
      setStatus(e?.message ?? "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  const summary = () => diff.data()?.diff?.summary;
  const changes = () => diff.data()?.diff?.changes ?? [];

  return (
    <CMSDashboardLayout
      title="Review Changes"
      description="Review draft changes before publishing"
      activeSection="pages"
      basePath={base()}
      toolbarRight={
        <RLButton
          variant="solid"
          color="primary"
          size="sm"
          disabled={publishing()}
          onClick={() => void publish()}
        >
          {publishing() ? "Publishing…" : "Approve & Publish"}
        </RLButton>
      }
    >
      <Show when={status()}>
        <p class="text-sm text-muted">{status()}</p>
      </Show>
      <Show when={pageData.data()?.page}>
        <p class="text-sm text-muted">
          Reviewing: {getLocalized(pageData.data()!.page.title, locale())}
        </p>
      </Show>
      <Show when={summary()}>
        <div class="flex gap-2 flex-wrap">
          <RLBadge variant="soft" color="success" size="xs">
            Added: {summary()?.added ?? 0}
          </RLBadge>
          <RLBadge variant="soft" color="neutral" size="xs">
            Removed: {summary()?.removed ?? 0}
          </RLBadge>
          <RLBadge variant="soft" color="neutral" size="xs">
            Modified: {summary()?.modified ?? 0}
          </RLBadge>
          <RLBadge variant="soft" color="neutral" size="xs">
            Unchanged: {summary()?.unchanged ?? 0}
          </RLBadge>
        </div>
      </Show>
      <div class="flex flex-col gap-4">
        <For each={changes()}>
          {(change: any) => (
            <div class="border border-default rounded-lg p-4">
              <p class="text-xs font-mono text-muted mb-2">
                {change.kind ?? change.type ?? "change"} — {change.blockId ?? change.id ?? ""}
              </p>
              <Show when={change.block}>
                <BlockRenderer block={change.block} locale={locale()} />
              </Show>
            </div>
          )}
        </For>
        <Show when={changes().length === 0 && !diff.loading()}>
          <p class="text-sm text-muted">No changes detected.</p>
        </Show>
      </div>
    </CMSDashboardLayout>
  );
};

export default PagesReviewPage;
