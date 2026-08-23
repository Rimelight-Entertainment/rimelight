import { createSignal, onMount, For, Show, type Component } from "solid-js"
import RLSInput from "@rimelight/ui/components/input/RLSInput.tsx"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"
import RLSBadge from "@rimelight/ui/components/badge/RLSBadge.tsx"
import RLSModal from "@rimelight/ui/components/modal/RLSModal.tsx"
import RLSIcon from "@rimelight/ui/components/icon/RLSIcon.tsx"

export interface TaxonomyTermRecord {
  id: string
  taxonomy: string
  name: string
  slug: string
  description?: string
  parentId?: string | null
  postCount?: number
  children?: TaxonomyTermRecord[]
}

export interface RimelightTaxonomyManagerProps {
  initialTaxonomy?: string
}

export const RimelightTaxonomyManager: Component<RimelightTaxonomyManagerProps> = (props) => {
  const [activeTaxonomy, setActiveTaxonomy] = createSignal<string>(
    props.initialTaxonomy || "category"
  )
  const [terms, setTerms] = createSignal<TaxonomyTermRecord[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = createSignal(false)
  const [editingTermId, setEditingTermId] = createSignal<string | null>(null)
  const [termForm, setTermForm] = createSignal<{
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
      const res = await fetch(`/api/cms/taxonomies/${activeTaxonomy()}/terms?includeCounts=true`)
      if (!res.ok) throw new Error("Failed to load taxonomy terms")
      const data = await res.json()
      setTerms(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message || "Failed to load terms")
    } finally {
      setIsLoading(false)
    }
  }

  onMount(() => {
    void loadTerms()
  })

  const handleTaxonomyTabChange = (tax: string) => {
    setActiveTaxonomy(tax)
    void loadTerms()
  }

  const openAddModal = (parentId: string = "") => {
    setEditingTermId(null)
    setTermForm({ name: "", slug: "", parentId, description: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (term: TaxonomyTermRecord) => {
    setEditingTermId(term.id)
    setTermForm({
      name: term.name,
      slug: term.slug,
      parentId: term.parentId || "",
      description: term.description || ""
    })
    setIsModalOpen(true)
  }

  const handleSaveTerm = async () => {
    const form = termForm()
    if (!form.name.trim()) return

    const slug =
      form.slug.trim() ||
      form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const payload = {
      name: form.name.trim(),
      slug,
      parentId: form.parentId ? form.parentId : null,
      description: form.description.trim()
    }

    try {
      if (editingTermId()) {
        const res = await fetch(
          `/api/cms/taxonomies/${activeTaxonomy()}/terms/${editingTermId()}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        )
        if (!res.ok) throw new Error("Failed to update term")
      } else {
        const res = await fetch(`/api/cms/taxonomies/${activeTaxonomy()}/terms`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Failed to create term")
      }

      setIsModalOpen(false)
      void loadTerms()
    } catch (err: any) {
      alert(err.message || "Failed to save term")
    }
  }

  const handleDeleteTerm = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete term "${name}"?`)) return

    try {
      const res = await fetch(`/api/cms/taxonomies/${activeTaxonomy()}/terms/${id}`, {
        method: "DELETE"
      })
      if (!res.ok) throw new Error("Failed to delete term")
      void loadTerms()
    } catch (err: any) {
      alert(err.message || "Failed to delete term")
    }
  }

  return (
    <div class="flex flex-col gap-6 w-full">
      {/* Header & Tabs */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-default pb-4">
        <div class="flex flex-col">
          <h2 class="text-xl font-bold text-highlighted">Taxonomy Manager</h2>
          <p class="text-xs text-muted mt-0.5">
            Organize posts and pages with hierarchical categories and flat tags.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex p-1 bg-elevated rounded-lg border border-default">
            <button
              type="button"
              onClick={() => handleTaxonomyTabChange("category")}
              class={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTaxonomy() === "category"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted hover:text-highlighted bg-transparent"
              }`}
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => handleTaxonomyTabChange("tag")}
              class={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                activeTaxonomy() === "tag"
                  ? "bg-background text-primary shadow-sm"
                  : "text-muted hover:text-highlighted bg-transparent"
              }`}
            >
              Tags
            </button>
          </div>

          <RLSButton
            variant="solid"
            color="primary"
            size="sm"
            onClick={() => openAddModal()}
            leadingIcon="plus"
            label={`Add ${activeTaxonomy() === "category" ? "Category" : "Tag"}`}
          />
        </div>
      </div>

      {/* Content Table / Tree */}
      <div class="bg-elevated/40 border border-default rounded-xl overflow-hidden">
        <Show when={isLoading()}>
          <div class="p-8 text-center text-sm text-muted animate-pulse">Loading terms...</div>
        </Show>

        <Show when={error()}>
          <div class="p-4 text-center text-sm text-error-500">{error()}</div>
        </Show>

        <Show when={!isLoading() && terms().length === 0}>
          <div class="p-12 text-center flex flex-col items-center justify-center gap-2">
            <RLSIcon name="folder" size="lg" class="text-muted/50" />
            <span class="text-sm font-semibold text-highlighted">
              No {activeTaxonomy()} terms found
            </span>
            <p class="text-xs text-muted max-w-sm">
              Create your first {activeTaxonomy()} term to classify articles and documentation.
            </p>
            <RLSButton
              variant="outline"
              color="primary"
              size="xs"
              onClick={() => openAddModal()}
              label="Create Term"
              class="mt-2"
            />
          </div>
        </Show>

        <Show when={!isLoading() && terms().length > 0}>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm border-collapse">
              <thead>
                <tr class="border-b border-default bg-elevated/70 text-xs font-semibold text-muted uppercase tracking-wider">
                  <th class="py-3 px-4">Name</th>
                  <th class="py-3 px-4">Slug</th>
                  <th class="py-3 px-4">Description</th>
                  <th class="py-3 px-4 text-center">Posts</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-default/50">
                <For each={terms()}>
                  {(term) => (
                    <tr class="hover:bg-elevated/50 transition">
                      <td class="py-3 px-4 font-medium text-highlighted flex items-center gap-2">
                        {activeTaxonomy() === "tag" ? (
                          <RLSBadge variant="soft" color="neutral" size="sm">
                            #{term.name}
                          </RLSBadge>
                        ) : (
                          <span>{term.name}</span>
                        )}
                      </td>
                      <td class="py-3 px-4 font-mono text-xs text-muted">{term.slug}</td>
                      <td class="py-3 px-4 text-xs text-muted max-w-xs truncate">
                        {term.description || "—"}
                      </td>
                      <td class="py-3 px-4 text-center">
                        <span class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                          {term.postCount ?? 0}
                        </span>
                      </td>
                      <td class="py-3 px-4 text-right">
                        <div class="inline-flex items-center gap-1">
                          <RLSButton
                            variant="ghost"
                            color="neutral"
                            size="xs"
                            square={true}
                            onClick={() => openEditModal(term)}
                            title="Edit"
                            leading={<RLSIcon name="edit" size="xs" />}
                          />
                          <RLSButton
                            variant="ghost"
                            color="neutral"
                            size="xs"
                            square={true}
                            onClick={() => handleDeleteTerm(term.id, term.name)}
                            title="Delete"
                            class="!text-error-500 hover:!text-error-600"
                            leading={<RLSIcon name="trash" size="xs" />}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </div>

      {/* Add / Edit Modal */}
      <RLSModal
        open={isModalOpen()}
        onClose={() => setIsModalOpen(false)}
        title={editingTermId() ? `Edit ${activeTaxonomy()}` : `Add New ${activeTaxonomy()}`}
        footerSlot={
          <>
            <RLSButton
              variant="outline"
              color="neutral"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              label="Cancel"
            />
            <RLSButton
              variant="solid"
              color="primary"
              size="sm"
              onClick={handleSaveTerm}
              label={editingTermId() ? "Update Term" : "Create Term"}
            />
          </>
        }
      >
        <div class="flex flex-col gap-4 py-2">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Name *</span>
            <RLSInput
              value={termForm().name}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setTermForm({ ...termForm(), name: e.currentTarget.value })
              }
              placeholder="e.g. Engineering, Guides, Releases"
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Slug (URL identifier)</span>
            <RLSInput
              value={termForm().slug}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setTermForm({ ...termForm(), slug: e.currentTarget.value })
              }
              placeholder="Auto-generated if left empty"
            />
          </div>

          <Show when={activeTaxonomy() === "category"}>
            <div class="flex flex-col gap-1">
              <span class="text-xs font-semibold text-muted">Parent Category</span>
              <select
                value={termForm().parentId}
                onChange={(e) => setTermForm({ ...termForm(), parentId: e.currentTarget.value })}
                class="w-full text-sm py-2 px-3 rounded-lg border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">(None - Top Level)</option>
                <For each={terms().filter((t) => t.id !== editingTermId())}>
                  {(cat) => <option value={cat.id}>{cat.name}</option>}
                </For>
              </select>
            </div>
          </Show>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Description</span>
            <textarea
              value={termForm().description}
              onInput={(e: InputEvent & { currentTarget: HTMLTextAreaElement }) =>
                setTermForm({ ...termForm(), description: e.currentTarget.value })
              }
              rows={3}
              placeholder="Optional description of this taxonomy term..."
              class="w-full text-sm py-2 px-3 rounded-lg border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>
        </div>
      </RLSModal>
    </div>
  )
}
