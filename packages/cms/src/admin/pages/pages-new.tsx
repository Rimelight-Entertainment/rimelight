import { createSignal, For, Show, type Component } from "solid-js"
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx"
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx"
import { useCmsApi } from "./_shared.tsx"

export interface PagesNewPageProps {
  basePath?: string | undefined
  apiBase?: string | undefined
  onCreated?: ((id: string) => void) | undefined
}

export const PagesNewPage: Component<PagesNewPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms"
  const apiBase = () => props.apiBase ?? "/api/cms"
  const [slug, setSlug] = createSignal("")
  const [type, setType] = createSignal("blog")
  const [title, setTitle] = createSignal("")
  const [templateId, setTemplateId] = createSignal("")
  const [saving, setSaving] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  const templates = useCmsApi<{ templates: any[] }>(`${apiBase()}/templates`)

  const submit = async (e: Event) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${apiBase()}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug(),
          type: type(),
          title: title(),
          templateId: templateId() || null
        })
      })
      if (!res.ok) throw new Error(`Create failed (${res.status})`)
      const data = (await res.json()) as any
      const id = data.page?.id as string
      if (props.onCreated && id) props.onCreated(id)
      else if (id && typeof window !== "undefined")
        window.location.href = `${base()}/pages/${id}/edit`
    } catch (e: any) {
      setError(e?.message ?? "Failed to create page")
    } finally {
      setSaving(false)
    }
  }

  return (
    <CMSDashboardLayout
      title="New Page"
      description="Create a new content page"
      activeSection="pages"
      basePath={base()}
    >
      <form onSubmit={(e) => void submit(e)} class="max-w-2xl flex flex-col gap-4">
        <Show when={error()}>
          <p class="text-sm text-error">{error()}</p>
        </Show>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Slug</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={slug()}
            onInput={(e) => setSlug(e.currentTarget.value)}
            placeholder="my-first-post"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Title</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            placeholder="Page title"
            required
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Type</span>
          <input
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={type()}
            onInput={(e) => setType(e.currentTarget.value)}
          />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="font-medium">Template (optional)</span>
          <select
            class="border border-default rounded-md px-3 py-2 bg-default"
            value={templateId()}
            onChange={(e) => setTemplateId(e.currentTarget.value)}
          >
            <option value="">No template</option>
            <For each={templates.data()?.templates ?? []}>
              {(t) => <option value={t.id}>{t.title ?? t.slug ?? t.id}</option>}
            </For>
          </select>
        </label>
        <div>
          <RLButton type="submit" variant="solid" color="primary" size="sm" disabled={saving()}>
            {saving() ? "Creating…" : "Create Page"}
          </RLButton>
        </div>
      </form>
    </CMSDashboardLayout>
  )
}

export default PagesNewPage
