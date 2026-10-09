import { Show, createSignal, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RimelightEditorLayout } from "../../client/components/RimelightEditorLayout";
import { parseContent, useCmsApi } from "./_shared";

export interface PagesEditPageProps {
  pageId: string;
  basePath?: string | undefined;
  apiBase?: string | undefined;
  locale?: string | undefined;
}

export const PagesEditPage: Component<PagesEditPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const [saving, setSaving] = createSignal(false);
  const [publishing, setPublishing] = createSignal(false);
  const [status, setStatus] = createSignal<string | null>(null);

  const pageData = useCmsApi<{ page: any; draft: any }>(() => `${apiBase()}/pages/${props.pageId}`);
  const initialBlocks = () => {
    const draft = pageData.data()?.draft;
    const page = pageData.data()?.page;
    const content = draft?.content ?? page?.content;
    return parseContent(content).blocks;
  };

  const saveDraft = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiBase()}/pages/${props.pageId}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: { blocks: initialBlocks(), properties: {} } }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setStatus("Draft saved");
      await pageData.refetch();
    } catch (e: any) {
      setStatus(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setPublishing(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiBase()}/pages/${props.pageId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { blocks: initialBlocks(), properties: {} },
          changeSummary: "Published from CMS admin",
        }),
      });
      if (!res.ok) throw new Error(`Publish failed (${res.status})`);
      setStatus("Published");
      await pageData.refetch();
    } catch (e: any) {
      setStatus(e?.message ?? "Publish failed");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <CMSDashboardLayout
      title="Edit Page"
      description="Edit page content blocks"
      activeSection="pages"
      basePath={base()}
      toolbarRight={
        <div class="flex items-center gap-2">
          <RLButton href={`${base()}/pages/${props.pageId}/preview`} variant="outline" size="sm">
            Preview
          </RLButton>
          <RLButton
            variant="outline"
            size="sm"
            disabled={saving()}
            onClick={() => void saveDraft()}
          >
            {saving() ? "Saving…" : "Save Draft"}
          </RLButton>
          <RLButton
            variant="solid"
            color="primary"
            size="sm"
            disabled={publishing()}
            onClick={() => void publish()}
          >
            {publishing() ? "Publishing…" : "Publish"}
          </RLButton>
        </div>
      }
    >
      <Show when={status()}>
        <p class="text-sm text-muted">{status()}</p>
      </Show>
      <Show when={pageData.loading()}>
        <p class="text-sm text-muted">Loading editor…</p>
      </Show>
      <Show when={pageData.data()}>
        <RimelightEditorLayout pageId={props.pageId} initialBlocks={initialBlocks()} />
      </Show>
    </CMSDashboardLayout>
  );
};
