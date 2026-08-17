import { createSignal, onMount, For, Show, type Component } from "solid-js"
import {
  getPageDefinition,
  type PageDefinition,
  type FieldDefinition
} from "../../core/page-definitions"

function getTextValue(value: any): string {
  if (typeof value === "string") return value
  if (typeof value === "object" && value !== null && "en" in value) return value.en
  if (typeof value === "number") return String(value)
  return ""
}

export interface RimelightPropertiesPanelProps {
  pageType?: string
  initialProperties?: Record<string, any>
  title?: string
  slug?: string
  icon?: string
  tags?: string[]
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

  const [isLinkModalOpen, setIsLinkModalOpen] = createSignal(false)
  const [editingLinkIndex, setEditingLinkIndex] = createSignal<number | null>(null)
  const [linkDraft, setLinkDraft] = createSignal({ label: "", to: "", icon: "" })

  onMount(() => {
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
      }
    }
    document.addEventListener("properties-change", handlePropsChange)
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
        <label class="flex flex-col gap-1 w-full cursor-pointer">
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
          <input
            type="text"
            data-field={fieldId}
            value={getTextValue(value)}
            onInput={(e) => handlePropertyChange(fieldId, e.currentTarget.value)}
            placeholder="Type here..."
            class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </label>
      )
    }

    if (field.type === "number") {
      return (
        <label class="flex flex-col gap-1 w-full cursor-pointer">
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
          <input
            type="number"
            data-field={fieldId}
            value={value !== undefined ? String(value) : ""}
            onInput={(e) => handlePropertyChange(fieldId, Number(e.currentTarget.value))}
            placeholder="0"
            class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </label>
      )
    }

    if (field.type === "enum") {
      return (
        <label class="flex flex-col gap-1 w-full cursor-pointer">
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
          <select
            data-field={fieldId}
            value={getTextValue(value)}
            onChange={(e) => handlePropertyChange(fieldId, e.currentTarget.value)}
            class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
          >
            <For each={field.options || []}>
              {(opt) => {
                const optVal = getTextValue(opt)
                return (
                  <option value={optVal} selected={getTextValue(value) === optVal}>
                    {optVal}
                  </option>
                )
              }}
            </For>
          </select>
        </label>
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
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
          <div class="flex flex-wrap gap-1 mb-1">
            <For each={arr}>
              {(item, idx) => (
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-foreground text-xs rounded-full border border-default">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx())}
                    class="ml-1 text-muted-foreground hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </For>
          </div>
          <div class="flex gap-1 mt-1">
            <input
              type="text"
              value={arrayInputs()[fieldId] || ""}
              onInput={(e) =>
                setArrayInputs((prev) => ({ ...prev, [fieldId]: e.currentTarget.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addArrayItem()
                }
              }}
              class="flex-1 bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Add item..."
            />
            <button
              type="button"
              onClick={addArrayItem}
              class="px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-foreground border border-default rounded-md text-sm font-medium transition cursor-pointer"
            >
              +
            </button>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <aside
      id="cms-properties-panel"
      class="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-default w-full shadow-sm"
    >
      <div class="bg-white dark:bg-neutral-900 border border-default rounded-xl p-4 shadow-sm flex flex-col">
        {/* Top header content matching PagePropertiesEditor.vue */}
        <div class="flex flex-col gap-2 items-center text-center">
          <div class="relative group/icon mb-1">
            <div class="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border-2 border-dashed border-default shadow-sm text-muted-foreground">
              <svg
                class="size-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
          </div>

          <span class="text-xs text-dimmed uppercase tracking-wider text-center block font-semibold text-muted-foreground">
            {pageType()} Properties
          </span>
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
                    class="flex justify-between items-center w-full p-2.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-left font-medium text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition cursor-pointer mt-2"
                  >
                    <span>{getTextValue(group.label)}</span>
                    <svg
                      class="size-4 opacity-60 transition-transform duration-150"
                      classList={{ "rotate-180": isExpanded() }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {isExpanded() && (
                    <div class="p-3 flex flex-col gap-3 bg-white dark:bg-neutral-900 border border-default rounded-b-lg border-t-0 -mt-1 shadow-sm">
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

      {/* Links section matching PagePropertiesEditor.vue */}
      <div class="flex flex-col gap-2 pt-2 border-t border-default">
        <div class="flex items-center justify-between mb-1">
          <h6 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Links</h6>
          <button
            type="button"
            onClick={() => openLinkModal()}
            class="p-1 rounded border border-default bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-foreground cursor-pointer transition flex items-center gap-1"
            title="Add Link"
          >
            <svg
              class="size-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Add</span>
          </button>
        </div>

        <Show
          when={links().length > 0}
          fallback={<p class="text-xs text-muted-foreground italic">No links added</p>}
        >
          <div class="flex flex-col gap-2">
            <For each={links()}>
              {(item, index) => (
                <div class="flex items-center justify-between p-2 rounded-lg border border-default bg-white dark:bg-neutral-900 shadow-sm text-sm">
                  <div class="flex items-center gap-2 truncate">
                    <svg
                      class="size-3.5 text-muted-foreground shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                    >
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span class="font-medium text-foreground truncate">{item.label}</span>
                  </div>
                  <div class="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => openLinkModal(index())}
                      class="p-1 text-muted-foreground hover:text-foreground cursor-pointer border-0 bg-transparent"
                      title="Edit"
                    >
                      <svg
                        class="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLink(index())}
                      class="p-1 text-red-500 hover:text-red-600 cursor-pointer border-0 bg-transparent"
                      title="Delete"
                    >
                      <svg
                        class="size-3.5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

      {/* Link Add/Edit Modal */}
      <Show when={isLinkModalOpen()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close modal"
            onClick={() => setIsLinkModalOpen(false)}
            class="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-default border-0 p-0"
          />
          <div class="relative z-10 bg-white dark:bg-neutral-900 border border-default rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div class="flex items-center justify-between px-4 py-3 border-b border-default">
              <h3 class="text-base font-semibold text-foreground">
                {editingLinkIndex() !== null ? "Edit Link" : "Add Link"}
              </h3>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                class="p-1 text-muted-foreground hover:text-foreground cursor-pointer text-sm"
              >
                ✕
              </button>
            </div>

            <div class="flex flex-col gap-4 p-4">
              <label class="flex flex-col gap-1 cursor-pointer">
                <span class="text-xs font-semibold text-muted-foreground">Label</span>
                <input
                  type="text"
                  value={linkDraft().label}
                  onInput={(e) => setLinkDraft({ ...linkDraft(), label: e.currentTarget.value })}
                  placeholder="e.g. GitHub Repository"
                  class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label class="flex flex-col gap-1 cursor-pointer">
                <span class="text-xs font-semibold text-muted-foreground">URL</span>
                <input
                  type="text"
                  value={linkDraft().to}
                  onInput={(e) => setLinkDraft({ ...linkDraft(), to: e.currentTarget.value })}
                  placeholder="https://..."
                  class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>
            </div>

            <div class="flex justify-end gap-2 p-4 border-t border-default bg-neutral-50 dark:bg-neutral-800/40">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                class="px-3 py-1.5 rounded-lg border border-default text-sm font-medium text-muted-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveLink}
                class="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 cursor-pointer transition shadow-sm"
              >
                {editingLinkIndex() !== null ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      </Show>
    </aside>
  )
}
