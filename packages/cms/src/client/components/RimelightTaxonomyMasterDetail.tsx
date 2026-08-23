import { createSignal, onMount, For, Show, createMemo, type Component } from "solid-js"
import RLSInput from "@rimelight/ui/components/input/RLSInput.tsx"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"
import RLSBadge from "@rimelight/ui/components/badge/RLSBadge.tsx"
import RLSIcon from "@rimelight/ui/components/icon/RLSIcon.tsx"

export interface TaxonomyRecord {
  id: string
  taxonomy: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  postCount?: number
}

export interface RimelightTaxonomyMasterDetailProps {
  taxonomy: string
  title?: string
  description?: string
}

export const RimelightTaxonomyMasterDetail: Component<RimelightTaxonomyMasterDetailProps> = (
  props
) => {
  const taxType = () => props.taxonomy || "category"
  const isCategory = () => taxType() === "category"
  const defaultTitle = () => (isCategory() ? "Categories" : "Tags")
  const defaultDesc = () =>
    isCategory()
      ? "Organize your content into hierarchical topics and sections."
      : "Label articles and posts with keywords for easy filtering."

  const [terms, setTerms] = createSignal<TaxonomyRecord[]>([])
  const [selectedId, setSelectedId] = createSignal<string | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")
  const [isLoading, setIsLoading] = createSignal(false)
  const [isSaving, setIsSaving] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  // Form State
  const [form, setForm] = createSignal<{
    name: string
    slug: string
    parentId: string
    description: string
  }>({
    name: "",
    slug: "",
    parentId: "",
    description: ""
  })

  const loadTerms = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/cms/taxonomies/${taxType()}/terms?includeCounts=true`)
      if (!res.ok) throw new Error(`Failed to load ${taxType()} terms`)
      const data = await res.json()
      const list: TaxonomyRecord[] = Array.isArray(data) ? data : []
      setTerms(list)

      if (list.length > 0 && !selectedId()) {
        selectTerm(list[0]!)
      } else if (list.length === 0) {
        startNewTerm()
      }
    } catch (err: any) {
      setError(err.message || "Failed to load terms")
    } finally {
      setIsLoading(false)
    }
  }

  onMount(() => {
    void loadTerms()
  })

  const filteredTerms = createMemo(() => {
    const q = searchQuery().toLowerCase().trim()
    if (!q) return terms()
    return terms().filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    )
  })

  const selectTerm = (term: TaxonomyRecord) => {
    setSelectedId(term.id)
    setForm({
      name: term.name || "",
      slug: term.slug || "",
      parentId: term.parentId || "",
      description: term.description || ""
    })
  }

  const startNewTerm = () => {
    setSelectedId(null)
    setForm({
      name: "",
      slug: "",
      parentId: "",
      description: ""
    })
  }

  const handleNameChange = (name: string) => {
    const isNew = !selectedId()
    const autoSlug = isNew
      ? name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : form().slug

    setForm((prev) => ({
      ...prev,
      name,
      slug: isNew ? autoSlug : prev.slug
    }))
  }

  const handleSave = async (e?: Event) => {
    e?.preventDefault()
    const f = form()
    if (!f.name.trim()) {
      alert("Name is required")
      return
    }

    const slug =
      f.slug.trim() ||
      f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const payload = {
      name: f.name.trim(),
      slug,
      parentId: isCategory() && f.parentId ? f.parentId : null,
      description: f.description.trim()
    }

    setIsSaving(true)
    try {
      if (selectedId()) {
        const res = await fetch(`/api/cms/taxonomies/${taxType()}/terms/${selectedId()}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Failed to update ${taxType()}`)
        const updated = await res.json()
        setTerms((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)))
      } else {
        const res = await fetch(`/api/cms/taxonomies/${taxType()}/terms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error(`Failed to create ${taxType()}`)
        const created = await res.json()
        setTerms((prev) => [created, ...prev])
        setSelectedId(created.id)
      }
    } catch (err: any) {
      alert(err.message || `Failed to save ${taxType()}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const id = selectedId()
    if (!id) return
    const current = terms().find((t) => t.id === id)
    if (!confirm(`Are you sure you want to delete "${current?.name || id}"?`)) return

    try {
      const res = await fetch(`/api/cms/taxonomies/${taxType()}/terms/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error(`Failed to delete ${taxType()}`)
      setTerms((prev) => prev.filter((t) => t.id !== id))
      const remaining = terms().filter((t) => t.id !== id)
      if (remaining.length > 0) {
        selectTerm(remaining[0]!)
      } else {
        startNewTerm()
      }
    } catch (err: any) {
      alert(err.message || `Failed to delete ${taxType()}`)
    }
  }

  return (
    <div class="flex flex-col gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div class="flex items-center justify-between border-b border-default pb-4">
        <div>
          <h1 class="text-2xl font-bold text-highlighted tracking-tight">
            {props.title || defaultTitle()}
          </h1>
          <p class="text-xs text-muted mt-0.5">{props.description || defaultDesc()}</p>
        </div>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search & Terms List (5 Cols) */}
        <div class="lg:col-span-5 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <RLSInput
                value={searchQuery()}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setSearchQuery(e.currentTarget.value)
                }
                placeholder={`Search ${props.title || defaultTitle().toLowerCase()}...`}
                size="sm"
              />
            </div>
            <RLSButton
              variant="solid"
              color="primary"
              size="sm"
              onClick={startNewTerm}
              leadingIcon="plus"
              label="New"
            />
          </div>

          <Show when={isLoading()}>
            <div class="p-8 text-center text-xs text-muted animate-pulse">Loading terms...</div>
          </Show>

          <Show when={error()}>
            <div class="p-4 text-center text-xs text-error-500">{error()}</div>
          </Show>

          <Show when={!isLoading() && filteredTerms().length === 0}>
            <div class="p-8 text-center border border-dashed border-default rounded-xl flex flex-col items-center gap-2">
              <RLSIcon name="folder" size="md" class="text-muted/50" />
              <span class="text-xs font-semibold text-highlighted">No terms found</span>
              <p class="text-[11px] text-muted">Create a term to organize your content.</p>
            </div>
          </Show>

          <div class="flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            <For each={filteredTerms()}>
              {(item) => {
                const isSelected = () => selectedId() === item.id
                return (
                  <button
                    type="button"
                    onClick={() => selectTerm(item)}
                    class={`flex items-center justify-between p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected()
                        ? "bg-elevated/90 border-primary shadow-sm"
                        : "bg-background/40 hover:bg-elevated/40 border-default"
                    }`}
                  >
                    <div class="flex items-center gap-2.5 min-w-0 flex-1">
                      <div class="w-8 h-8 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                        {isCategory() ? "📁" : "#"}
                      </div>
                      <div class="flex flex-col min-w-0 flex-1">
                        <span class="text-sm font-semibold text-highlighted truncate">
                          {item.name}
                        </span>
                        <span class="text-xs font-mono text-muted truncate">{item.slug}</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-elevated text-muted border border-default">
                        {item.postCount ?? 0} posts
                      </span>
                      <Show when={isSelected()}>
                        <RLSBadge variant="solid" color="primary" size="sm">
                          Active
                        </RLSBadge>
                      </Show>
                    </div>
                  </button>
                )
              }}
            </For>
          </div>
        </div>

        {/* Right Column: Edit / Create Form (7 Cols) */}
        <div class="lg:col-span-7 bg-elevated/30 border border-default rounded-2xl p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <h3 class="text-lg font-bold text-highlighted">
              {selectedId()
                ? `Edit ${isCategory() ? "category" : "tag"}`
                : `Create ${isCategory() ? "category" : "tag"}`}
            </h3>
            <Show when={selectedId()}>
              <span class="text-xs font-mono text-muted">ID: {selectedId()}</span>
            </Show>
          </div>

          <form onSubmit={handleSave} class="flex flex-col gap-4">
            {/* Name */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Display name *</label>
              <RLSInput
                value={form().name}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  handleNameChange(e.currentTarget.value)
                }
                placeholder={
                  isCategory() ? "e.g. Engineering, Tutorials" : "e.g. typescript, astro"
                }
              />
            </div>

            {/* Slug */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Slug</label>
              <RLSInput
                value={form().slug}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setForm((prev) => ({ ...prev, slug: e.currentTarget.value }))
                }
                placeholder="engineering"
              />
            </div>

            {/* Parent Category (if category) */}
            <Show when={isCategory()}>
              <div class="flex flex-col gap-1.5">
                <label class="text-xs font-semibold text-neutral-700">Parent Category</label>
                <select
                  value={form().parentId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, parentId: e.currentTarget.value }))
                  }
                  class="w-full text-sm py-2 px-3 rounded-lg border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">(None - Top Level)</option>
                  <For each={terms().filter((t) => t.id !== selectedId())}>
                    {(cat) => <option value={cat.id}>{cat.name}</option>}
                  </For>
                </select>
              </div>
            </Show>

            {/* Description */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Description</label>
              <textarea
                value={form().description}
                onInput={(e: InputEvent & { currentTarget: HTMLTextAreaElement }) =>
                  setForm((prev) => ({ ...prev, description: e.currentTarget.value }))
                }
                rows={3}
                placeholder="Optional description..."
                class="w-full text-sm py-2 px-3 rounded-lg border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Form Actions */}
            <div class="flex items-center justify-between border-t border-default pt-4 mt-2">
              <Show when={selectedId()} fallback={<div />}>
                <RLSButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={handleDelete}
                  label="Delete"
                  class="!text-error-500 hover:!text-error-600 !border-error-500/30"
                />
              </Show>

              <div class="flex items-center gap-2">
                <RLSButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={startNewTerm}
                  label="Cancel"
                />
                <RLSButton
                  type="submit"
                  variant="solid"
                  color="primary"
                  size="sm"
                  disabled={isSaving()}
                  label={
                    isSaving()
                      ? "Saving..."
                      : selectedId()
                        ? "Save Changes"
                        : `Create ${isCategory() ? "Category" : "Tag"}`
                  }
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
