import { createSignal, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { PageRenderer } from "../../solid/PageRenderer";
import { getLocalized, parseContent, useCmsApi } from "./_shared";

export interface PagesPreviewPageProps {
  pageId: string;
  basePath?: string | undefined;
  apiBase?: string | undefined;
  locale?: string | undefined;
  initialPage?: any;
  initialDraft?: any;
}

export const PagesPreviewPage: Component<PagesPreviewPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const locale = () => props.locale ?? "en";
  const [shareState, setShareState] = createSignal("Share Preview Link");

  const remote = useCmsApi<{ page: any; draft: any }>(() =>
    props.initialPage ? null : `${apiBase()}/pages/${props.pageId}`,
  );
  const page = () => props.initialPage ?? remote.data()?.page;
  const draft = () => props.initialDraft ?? remote.data()?.draft;
  const content = () => parseContent(draft()?.content ?? page()?.content);
  const title = () => getLocalized(page()?.title, locale()) || "Preview";

  const share = async () => {
    setShareState("Generating…");
    try {
      const res = await fetch(`${apiBase()}/pages/${props.pageId}/preview-token`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("token failed");
      const data = (await res.json()) as any;
      await navigator.clipboard.writeText(`${window.location.origin}${data.previewUrl}`);
      setShareState("Copied to Clipboard!");
      setTimeout(() => setShareState("Share Preview Link"), 3000);
    } catch {
      setShareState("Share Preview Link");
    }
  };

  return (
    <CMSDashboardLayout
      title={`Preview: ${title()}`}
      description="Preview CMS page"
      activeSection="pages"
      basePath={base()}
      toolbarRight={
        <div class="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void share()}
            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {shareState()}
          </button>
          <RLButton href={`${base()}/pages/${props.pageId}/edit`} variant="outline" size="sm">
            Back to Editor
          </RLButton>
        </div>
      }
    >
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="bg-primary/10 border border-primary/20 p-4 rounded-lg flex items-center justify-between">
          <p class="text-sm text-primary font-medium">
            Live Preview Mode — displaying current draft
          </p>
          <span class="text-xs px-2.5 py-0.5 bg-primary/20 text-primary rounded-full font-mono">
            Draft
          </span>
        </div>
        <div class="bg-elevated/40 rounded-xl shadow-sm border border-default p-8">
          <h1 class="text-3xl font-bold text-highlighted mb-6">{title()}</h1>
          <Show when={page()}>
            <PageRenderer
              blocks={content().blocks}
              locale={locale()}
              class="prose prose-lg max-w-none"
            />
          </Show>
        </div>
      </div>
    </CMSDashboardLayout>
  );
};
