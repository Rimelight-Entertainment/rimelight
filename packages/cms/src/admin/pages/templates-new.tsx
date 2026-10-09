import { createSignal, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RimelightTemplateEditor } from "../../client/components/RimelightTemplateEditor";

export interface TemplatesNewPageProps {
  basePath?: string | undefined;
  apiBase?: string | undefined;
  onCreated?: ((id: string) => void) | undefined;
}

export const TemplatesNewPage: Component<TemplatesNewPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const [slug, setSlug] = createSignal("");
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [pageType, setPageType] = createSignal("blog");
  const [blocks, setBlocks] = createSignal<any[]>([]);
  const [saving, setSaving] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  const submit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug(),
          title: title(),
          description: description(),
          pageType: pageType(),
          initialBlocks: blocks(),
        }),
      });
      if (!res.ok) throw new Error(`Create failed (${res.status})`);
      const data = (await res.json()) as any;
      const id = data.template?.[0]?.id ?? data.template?.id;
      if (props.onCreated && id) props.onCreated(id);
      else if (id && typeof window !== "undefined")
        window.location.href = `${base()}/templates/${id}/edit`;
    } catch (e: any) {
      setError(e?.message ?? "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSDashboardLayout
      title="New Template"
      description="Create a reusable page template"
      activeSection="templates"
      basePath={base()}
    >
      <form onSubmit={(e) => void submit(e)} class="flex flex-col gap-4 max-w-3xl">
        <Show when={error()}>
          <p class="text-sm text-error">{error()}</p>
        </Show>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Slug</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={slug()}
            onInput={(e) => setSlug(e.currentTarget.value)}
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Title</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Description</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Page type</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={pageType()}
            onInput={(e) => setPageType(e.currentTarget.value)}
          />
        </label>
        <RimelightTemplateEditor initialBlocks={blocks()} onChange={setBlocks} />
        <div>
          <RLButton type="submit" variant="solid" color="primary" size="sm" disabled={saving()}>
            {saving() ? "Creating…" : "Create Template"}
          </RLButton>
        </div>
      </form>
    </CMSDashboardLayout>
  );
};
