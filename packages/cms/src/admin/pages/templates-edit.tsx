import { createSignal, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RimelightTemplateEditor } from "../../client/components/RimelightTemplateEditor.tsx";
import { useCmsApi } from "./_shared.tsx";

export interface TemplatesEditPageProps {
  templateId: string;
  basePath?: string | undefined;
  apiBase?: string | undefined;
}

export const TemplatesEditPage: Component<TemplatesEditPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const [title, setTitle] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [blocks, setBlocks] = createSignal<any[]>([]);
  const [loaded, setLoaded] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [status, setStatus] = createSignal<string | null>(null);

  const remote = useCmsApi<{ template: any }>(() => `${apiBase()}/templates/${props.templateId}`);

  const template = () => {
    const t = remote.data()?.template;
    return Array.isArray(t) ? t[0] : t;
  };

  const hydrate = () => {
    if (!loaded() && template()) {
      const t = template();
      setTitle(t.title ?? "");
      setDescription(t.description ?? "");
      setBlocks(t.initialBlocks ?? []);
      setLoaded(true);
    }
  };
  hydrate();

  const submit = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiBase()}/templates/${props.templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title(),
          description: description(),
          initialBlocks: blocks()
        })
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setStatus("Template saved");
    } catch (e: any) {
      setStatus(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSDashboardLayout
      title="Edit Template"
      description="Update template schema and starter blocks"
      activeSection="templates"
      basePath={base()}
    >
      <Show when={remote.loading()}>
        <p class="text-sm text-muted">Loading template…</p>
      </Show>
      <Show when={loaded()}>
        <form onSubmit={(e) => void submit(e)} class="flex flex-col gap-4 max-w-3xl">
          <Show when={status()}>
            <p class="text-sm text-muted">{status()}</p>
          </Show>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium">Title</span>
            <input
              class="border border-default rounded-md px-3 py-2 bg-default"
              value={title()}
              onInput={(e) => setTitle(e.currentTarget.value)}
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
          <RimelightTemplateEditor initialBlocks={blocks()} onChange={setBlocks} />
          <div>
            <RLButton type="submit" variant="solid" color="primary" size="sm" disabled={saving()}>
              {saving() ? "Saving…" : "Save Template"}
            </RLButton>
          </div>
        </form>
      </Show>
    </CMSDashboardLayout>
  );
};

export default TemplatesEditPage;
