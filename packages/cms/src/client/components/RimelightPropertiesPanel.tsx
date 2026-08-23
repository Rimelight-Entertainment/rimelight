import { createSignal, onMount, For, Show, type Component } from "solid-js"
import {
  getPageDefinition,
  type PageDefinition,
  type FieldDefinition
} from "../../core/page-definitions.ts"
import RLSInput from "@rimelight/ui/components/input/RLSInput.tsx"
import RLSSelect from "@rimelight/ui/components/select/RLSSelect.tsx"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"
import RLSBadge from "@rimelight/ui/components/badge/RLSBadge.tsx"
import RLSModal from "@rimelight/ui/components/modal/RLSModal.tsx"
import RLSIcon from "@rimelight/ui/components/icon/RLSIcon.tsx"

function getTextValue(value: any): string {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "en" in value) return value.en
  if (typeof value === "number") return String(value)
  return ""
}

export interface BylineItem {
  name: string
  avatar?: string
  role?: string
  url?: string
}

export interface RimelightPropertiesPanelProps {
  pageType?: string
  initialProperties?: Record<string, any>
  title?: string
  slug?: string
  icon?: string
  tags?: string[]
  bylines?: BylineItem[]
  onPropertiesChange?: (props: Record<string, any>) => void
  class?: string
}

export const RimelightPropertiesPanel: Component<RimelightPropertiesPanelProps> = (
  componentProps
) => {
  const pageType = () => componentProps.pageType || "blog"
  const definition = (): PageDefinition | null => getPageDefinition(pageType())

  const [properties, setProperties] = createSignal<Record<string, any>>(
    componentProps.initialProperties || {}
  )
  const [expandedGroups, setExpandedGroups] = createSignal<Record<string, boolean>>({})
  const [arrayInputs, setArrayInputs] = createSignal<Record<string, string>>({})
  const [links, setLinks] = createSignal<Array<{ label: string; to: string; icon?: string }>>(
    componentProps.initialProperties?.links || []
  )

  // Bylines state
  const [availableBylines, setAvailableBylines] = createSignal<BylineItem[]>([])
  const [bylines, setBylines] = createSignal<BylineItem[]>(
    componentProps.bylines || componentProps.initialProperties?.bylines || []
  )
  const [isBylineModalOpen, setIsBylineModalOpen] = createSignal(false)
  const [editingBylineIndex, setEditingBylineIndex] = createSignal<number | null>(null)
  const [bylineDraft, setBylineDraft] = createSignal<BylineItem>({
    name: "",
    avatar: "",
    role: "",
    url: ""
  })

  // Taxonomies state
  const [categoriesList, setCategoriesList] = createSignal<
    Array<{ id: string; name: string; slug: string }>
  >([])
  const [selectedCategory, setSelectedCategory] = createSignal<string>(
    componentProps.initialProperties?.category || ""
  )
  const [tagsList, setTagsList] = createSignal<string[]>(
    componentProps.tags || componentProps.initialProperties?.tags || []
  )
  const [newTagInput, setNewTagInput] = createSignal("")

  const [isLinkModalOpen, setIsLinkModalOpen] = createSignal(false)
  const [editingLinkIndex, setEditingLinkIndex] = createSignal<number | null>(null)
  const [linkDraft, setLinkDraft] = createSignal({ label: "", to: "", icon: "" })

  onMount(async () => {
    const def = definition()
    if (def?.properties) {
      const initialExpanded: Record<string, boolean> = {}
      Object.entries(def.properties).forEach(([groupId, group]) => {
        initialExpanded[groupId] = group.defaultOpen ?? true
      })
      setExpandedGroups(initialExpanded)
    }

    const handlePropsChange = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.properties) {
        setProperties(e.detail.properties)
        if (e.detail.properties.bylines) setBylines(e.detail.properties.bylines)
        if (e.detail.properties.tags) setTagsList(e.detail.properties.tags)
        if (e.detail.properties.category) setSelectedCategory(e.detail.properties.category)
      }
    }
    document.addEventListener("properties-change", handlePropsChange)

    // Load available taxonomy categories
    try {
      const res = await fetch("/api/cms/taxonomies/category/terms")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setCategoriesList(data.map((t: any) => ({ id: t.id, name: t.name, slug: t.slug })))
        }
      }
    } catch {
      // ignore
    }

    // Load available global bylines
    try {
      const res = await fetch("/api/cms/bylines")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setAvailableBylines(
            data.map((b: any) => ({
              name: b.name,
              avatar: b.avatar || "",
              role: b.bio || "",
              url: b.websiteUrl || ""
            }))
          )
        }
      }
    } catch {
      // ignore
    }
  })

  const handlePropertyChange = (key: string, value: any) => {
    const updated = { ...properties(), [key]: value }
    setProperties(updated)
    componentProps.onPropertiesChange?.(updated)
    if (typeof document !== "undefined") {
      document.dispatchEvent(
        new CustomEvent("properties-change", { detail: { properties: updated }, bubbles: true })
      )
    }
    if (typeof window !== "undefined") {
      ;(window as any).cmsPageProperties = updated
    }
  }

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  // Bylines Handlers
  const openBylineModal = (index: number | null = null) => {
    setEditingBylineIndex(index)
    if (index !== null && bylines()[index]) {
      const b = bylines()[index]!
      setBylineDraft({ name: b.name, avatar: b.avatar || "", role: b.role || "", url: b.url || "" })
    } else {
      setBylineDraft({ name: "", avatar: "", role: "", url: "" })
    }
    setIsBylineModalOpen(true)
  }

  const saveByline = () => {
    const draft = bylineDraft()
    if (!draft.name) return
    const current = [...bylines()]
    const idx = editingBylineIndex()
    if (idx !== null) {
      current[idx] = draft
    } else {
      current.push(draft)
    }
    setBylines(current)
    handlePropertyChange("bylines", current)
    setIsBylineModalOpen(false)
  }

  const removeByline = (index: number) => {
    const current = [...bylines()]
    current.splice(index, 1)
    setBylines(current)
    handlePropertyChange("bylines", current)
  }

  // Taxonomies Handlers
  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug)
    handlePropertyChange("category", slug)
  }

  const addTag = () => {
    const tag = newTagInput().trim().toLowerCase()
    if (tag && !tagsList().includes(tag)) {
      const updated = [...tagsList(), tag]
      setTagsList(updated)
      handlePropertyChange("tags", updated)
      setNewTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const updated = tagsList().filter((t) => t !== tagToRemove)
    setTagsList(updated)
    handlePropertyChange("tags", updated)
  }

  // Links Handlers
  const openLinkModal = (index: number | null = null) => {
    setEditingLinkIndex(index)
    if (index !== null && links()[index]) {
      const l = links()[index]!
      setLinkDraft({ label: l.label, to: l.to, icon: l.icon || "" })
    } else {
      setLinkDraft({ label: "", to: "", icon: "" })
    }
    setIsLinkModalOpen(true)
  }

  const saveLink = () => {
    const draft = linkDraft()
    if (!draft.label || !draft.to) return
    const current = [...links()]
    const idx = editingLinkIndex()
    if (idx !== null) {
      current[idx] = draft
    } else {
      current.push(draft)
    }
    setLinks(current)
    handlePropertyChange("links", current)
    setIsLinkModalOpen(false)
  }

  const removeLink = (index: number) => {
    const current = [...links()]
    current.splice(index, 1)
    setLinks(current)
    handlePropertyChange("links", current)
  }

  const renderField = (fieldId: string, field: FieldDefinition) => {
    const label = getTextValue(field.label)
    const value = properties()[fieldId] !== undefined ? properties()[fieldId] : field.defaultValue

    if (field.type === "text") {
      return (
        <div class="flex flex-col gap-1 w-full">
          <span class="text-xs font-semibold text-neutral-600 block">{label}</span>
          <RLSInput
            value={getTextValue(value)}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
              handlePropertyChange(fieldId, e.currentTarget.value)
            }
            placeholder="Type here..."
            size="sm"
          />
        </div>
      )
    }

    if (field.type === "number") {
      return (
        <div class="flex flex-col gap-1 w-full">
          <span class="text-xs font-semibold text-neutral-600 block">{label}</span>
          <RLSInput
            type="number"
            value={value !== undefined ? String(value) : ""}
            onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
              handlePropertyChange(fieldId, Number(e.currentTarget.value))
            }
            placeholder="0"
            size="sm"
          />
        </div>
      )
    }

    if (field.type === "enum") {
      const selectItems = (field.options || []).map((opt) => getTextValue(opt))
      return (
        <div class="flex flex-col gap-1 w-full">
          <span class="text-xs font-semibold text-neutral-600 block">{label}</span>
          <RLSSelect
            items={selectItems}
            value={getTextValue(value)}
            onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
              handlePropertyChange(fieldId, e.currentTarget.value)
            }
            size="sm"
          />
        </div>
      )
    }

    if (field.type === "text-array" || field.type === "page-array") {
      const arr: string[] = Array.isArray(value) ? value : []

      const addArrayItem = () => {
        const inputVal = arrayInputs()[fieldId]?.trim()
        if (inputVal) {
          handlePropertyChange(fieldId, [...arr, inputVal])
          setArrayInputs((prev) => ({ ...prev, [fieldId]: "" }))
        }
      }

      const removeArrayItem = (idx: number) => {
        const updatedArr = [...arr]
        updatedArr.splice(idx, 1)
        handlePropertyChange(fieldId, updatedArr)
      }

      return (
        <div class="flex flex-col gap-1 w-full">
          <span class="text-xs font-semibold text-neutral-600 block">{label}</span>
          <div class="flex flex-wrap gap-1 mb-1">
            <For each={arr}>
              {(item, idx) => (
                <RLSBadge variant="soft" color="neutral" size="sm">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx())}
                    class="ml-1 text-muted hover:text-error-500 cursor-pointer bg-transparent border-0 p-0 inline-flex items-center"
                  >
                    ×
                  </button>
                </RLSBadge>
              )}
            </For>
          </div>
          <div class="flex gap-1 mt-1">
            <div class="flex-1">
              <RLSInput
                value={arrayInputs()[fieldId] || ""}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setArrayInputs((prev) => ({ ...prev, [fieldId]: e.currentTarget.value }))
                }
                onKeyDown={(e: KeyboardEvent) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addArrayItem()
                  }
                }}
                size="sm"
                placeholder="Add item..."
              />
            </div>
            <RLSButton
              variant="outline"
              color="neutral"
              size="sm"
              onClick={addArrayItem}
              label="+"
            />
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <aside id="cms-properties-panel" class="flex flex-col gap-4 p-4 w-full bg-transparent">
      <div class="flex flex-col">
        {/* Top header content */}
        <div class="flex flex-col gap-2 items-center text-center">
          <div class="relative group/icon mb-1">
            <div class="w-10 h-10 rounded-full flex items-center justify-center border border-default text-muted">
              <RLSIcon name="fileText" size="md" />
            </div>
          </div>

          <span class="text-xs uppercase tracking-wider text-center block font-semibold text-muted">
            {pageType()} Properties
          </span>
        </div>

        {/* Taxonomies Section */}
        <div class="mt-4 p-3 rounded-lg border border-default/70 bg-elevated/30 flex flex-col gap-3">
          <h6 class="text-xs font-bold uppercase tracking-wider text-muted">Taxonomies</h6>

          {/* Category */}
          <div class="flex flex-col gap-1 w-full">
            <span class="text-xs font-semibold text-neutral-600 block">Category</span>
            <select
              value={selectedCategory()}
              onChange={(e) => handleCategoryChange(e.currentTarget.value)}
              class="w-full text-xs py-1.5 px-2.5 rounded-md border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">(None)</option>
              <For each={categoriesList()}>
                {(cat) => (
                  <option value={cat.slug} selected={selectedCategory() === cat.slug}>
                    {cat.name}
                  </option>
                )}
              </For>
            </select>
          </div>

          {/* Tags */}
          <div class="flex flex-col gap-1 w-full">
            <span class="text-xs font-semibold text-neutral-600 block">Tags</span>
            <div class="flex flex-wrap gap-1 mb-1">
              <For each={tagsList()}>
                {(tag) => (
                  <RLSBadge variant="soft" color="primary" size="sm">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      class="ml-1 text-muted hover:text-error-500 cursor-pointer bg-transparent border-0 p-0 inline-flex items-center"
                    >
                      ×
                    </button>
                  </RLSBadge>
                )}
              </For>
            </div>
            <div class="flex gap-1 mt-1">
              <div class="flex-1">
                <RLSInput
                  value={newTagInput()}
                  onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                    setNewTagInput(e.currentTarget.value)
                  }
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  size="sm"
                  placeholder="Add tag..."
                />
              </div>
              <RLSButton variant="outline" color="neutral" size="sm" onClick={addTag} label="+" />
            </div>
          </div>
        </div>

        {/* Bylines / Authors Section */}
        <div class="mt-3 p-3 rounded-lg border border-default/70 bg-elevated/30 flex flex-col gap-2">
          <div class="flex items-center justify-between mb-1">
            <h6 class="text-xs font-bold uppercase tracking-wider text-muted">Bylines / Authors</h6>
            <RLSButton
              variant="ghost"
              color="neutral"
              size="xs"
              onClick={() => openBylineModal()}
              leadingIcon="plus"
              label="Add Custom"
            />
          </div>

          <Show when={availableBylines().length > 0}>
            <select
              onChange={(e) => {
                const authorName = e.currentTarget.value
                if (!authorName) return
                const found = availableBylines().find((b) => b.name === authorName)
                if (found && !bylines().some((b) => b.name === found.name)) {
                  const updated = [...bylines(), found]
                  setBylines(updated)
                  handlePropertyChange("bylines", updated)
                }
                e.currentTarget.value = ""
              }}
              class="w-full text-xs py-1.5 px-2 rounded-md border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary mb-1"
            >
              <option value="">+ Select from global bylines...</option>
              <For each={availableBylines()}>
                {(author) => <option value={author.name}>{author.name}</option>}
              </For>
            </select>
          </Show>

          <Show
            when={bylines().length > 0}
            fallback={<p class="text-xs text-muted italic">No authors attached</p>}
          >
            <div class="flex flex-col gap-2">
              <For each={bylines()}>
                {(byline, idx) => (
                  <div class="flex items-center justify-between p-2 rounded-lg border border-default/50 text-xs bg-background/50">
                    <div class="flex items-center gap-2 truncate">
                      {byline.avatar ? (
                        <img
                          src={byline.avatar}
                          alt={byline.name}
                          class="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div class="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                          {byline.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div class="flex flex-col truncate">
                        <span class="font-semibold text-highlighted truncate">{byline.name}</span>
                        {byline.role && (
                          <span class="text-[10px] text-muted truncate">{byline.role}</span>
                        )}
                      </div>
                    </div>
                    <div class="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openBylineModal(idx())}
                        class="text-muted hover:text-primary cursor-pointer p-1"
                        title="Edit"
                      >
                        <RLSIcon name="edit" size="xs" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeByline(idx())}
                        class="text-muted hover:text-error-500 cursor-pointer p-1"
                        title="Delete"
                      >
                        <RLSIcon name="trash" size="xs" />
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </div>

        {/* Property Groups Accordion */}
        <div class="mt-4 space-y-2 w-full">
          <For each={Object.entries(definition()?.properties || {})}>
            {([groupId, group]) => {
              const isExpanded = () => expandedGroups()[groupId] ?? true
              return (
                <div class="w-full" data-group-id={groupId}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    class="flex justify-between items-center w-full p-2 rounded-lg text-left font-medium text-sm text-highlighted hover:bg-elevated transition cursor-pointer mt-2 bg-transparent border-0"
                  >
                    <span>{getTextValue(group.label)}</span>
                    <RLSIcon
                      name="chevronDown"
                      size="sm"
                      class={`transition-transform duration-150 text-muted ${
                        isExpanded() ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isExpanded() && (
                    <div class="p-3 flex flex-col gap-3 border-t border-default/50 -mt-1">
                      <For each={Object.entries(group.fields || {})}>
                        {([fieldId, field]) => renderField(fieldId, field)}
                      </For>
                    </div>
                  )}
                </div>
              )
            }}
          </For>
        </div>
      </div>

      {/* Links section */}
      <div class="flex flex-col gap-2 pt-2 border-t border-default">
        <div class="flex items-center justify-between mb-1">
          <h6 class="text-xs font-bold uppercase tracking-wider text-muted">Links</h6>
          <RLSButton
            variant="ghost"
            color="neutral"
            size="xs"
            onClick={() => openLinkModal()}
            leadingIcon="plus"
            label="Add"
          />
        </div>

        <Show
          when={links().length > 0}
          fallback={<p class="text-xs text-muted italic">No links added</p>}
        >
          <div class="flex flex-col gap-2">
            <For each={links()}>
              {(item, index) => (
                <div class="flex items-center justify-between p-2 rounded-lg border border-default text-sm">
                  <div class="flex items-center gap-2 truncate">
                    <RLSIcon name="link" size="xs" class="text-muted shrink-0" />
                    <span class="font-medium text-highlighted truncate">{item.label}</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <RLSButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      square={true}
                      onClick={() => openLinkModal(index())}
                      aria-label="Edit"
                      title="Edit"
                      leading={<RLSIcon name="edit" size="xs" />}
                    />
                    <RLSButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      square={true}
                      onClick={() => removeLink(index())}
                      aria-label="Delete"
                      title="Delete"
                      class="!text-error-500 hover:!text-error-600"
                      leading={<RLSIcon name="trash" size="xs" />}
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Byline Modal */}
      <RLSModal
        open={isBylineModalOpen()}
        onClose={() => setIsBylineModalOpen(false)}
        title={editingBylineIndex() !== null ? "Edit Author Byline" : "Add Author Byline"}
        footerSlot={
          <>
            <RLSButton
              variant="outline"
              color="neutral"
              size="sm"
              onClick={() => setIsBylineModalOpen(false)}
              label="Cancel"
            />
            <RLSButton
              variant="solid"
              color="primary"
              size="sm"
              onClick={saveByline}
              label={editingBylineIndex() !== null ? "Update" : "Add"}
            />
          </>
        }
      >
        <div class="flex flex-col gap-4 py-2">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Author Name *</span>
            <RLSInput
              value={bylineDraft().name}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setBylineDraft({ ...bylineDraft(), name: e.currentTarget.value })
              }
              placeholder="e.g. Idan"
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Role / Title</span>
            <RLSInput
              value={bylineDraft().role || ""}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setBylineDraft({ ...bylineDraft(), role: e.currentTarget.value })
              }
              placeholder="e.g. Lead Producer"
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Avatar URL</span>
            <RLSInput
              value={bylineDraft().avatar || ""}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setBylineDraft({ ...bylineDraft(), avatar: e.currentTarget.value })
              }
              placeholder="https://..."
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Profile / Website URL</span>
            <RLSInput
              value={bylineDraft().url || ""}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setBylineDraft({ ...bylineDraft(), url: e.currentTarget.value })
              }
              placeholder="https://rimelight.com/authors/..."
            />
          </div>
        </div>
      </RLSModal>

      {/* Link Add/Edit Modal */}
      <RLSModal
        open={isLinkModalOpen()}
        onClose={() => setIsLinkModalOpen(false)}
        title={editingLinkIndex() !== null ? "Edit Link" : "Add Link"}
        footerSlot={
          <>
            <RLSButton
              variant="outline"
              color="neutral"
              size="sm"
              onClick={() => setIsLinkModalOpen(false)}
              label="Cancel"
            />
            <RLSButton
              variant="solid"
              color="primary"
              size="sm"
              onClick={saveLink}
              label={editingLinkIndex() !== null ? "Update" : "Add"}
            />
          </>
        }
      >
        <div class="flex flex-col gap-4 py-2">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">Label</span>
            <RLSInput
              value={linkDraft().label}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setLinkDraft({ ...linkDraft(), label: e.currentTarget.value })
              }
              placeholder="e.g. GitHub Repository"
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted">URL</span>
            <RLSInput
              value={linkDraft().to}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setLinkDraft({ ...linkDraft(), to: e.currentTarget.value })
              }
              placeholder="https://..."
            />
          </div>
        </div>
      </RLSModal>
    </aside>
  )
}
