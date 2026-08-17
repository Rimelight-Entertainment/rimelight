import { createSignal, onMount, For, Show, type Component } from "solid-js"
import {
  getPageDefinition,
  type PageDefinition,
  type FieldDefinition
} from "../../core/page-definitions"
import RLSInput from "@rimelight/ui/components/input/RLSInput"
import RLSSelect from "@rimelight/ui/components/select/RLSSelect"
import RLSButton from "@rimelight/ui/components/button/RLSButton"
import RLSBadge from "@rimelight/ui/components/badge/RLSBadge"
import RLSModal from "@rimelight/ui/components/modal/RLSModal"
import RLSIcon from "@rimelight/ui/components/icon/RLSIcon"

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
        <div class="flex flex-col gap-1 w-full">
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
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
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
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
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
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
          <span class="text-xs font-semibold text-neutral-600 dark:text-neutral-400 block">
            {label}
          </span>
          <div class="flex flex-wrap gap-1 mb-1">
            <For each={arr}>
              {(item, idx) => (
                <RLSBadge variant="soft" color="neutral" size="sm">
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx())}
                    class="ml-1 text-muted-foreground hover:text-red-500 cursor-pointer bg-transparent border-0 p-0 inline-flex items-center"
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
            <div class="w-10 h-10 rounded-full flex items-center justify-center border border-default text-muted-foreground">
              <RLSIcon name="fileText" size="md" />
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
                    class="flex justify-between items-center w-full p-2 rounded-lg text-left font-medium text-sm text-foreground hover:bg-elevated transition cursor-pointer mt-2 bg-transparent border-0"
                  >
                    <span>{getTextValue(group.label)}</span>
                    <RLSIcon
                      name="chevronDown"
                      size="sm"
                      class={`transition-transform duration-150 text-muted-foreground ${
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
          <h6 class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Links</h6>
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
          fallback={<p class="text-xs text-muted-foreground italic">No links added</p>}
        >
          <div class="flex flex-col gap-2">
            <For each={links()}>
              {(item, index) => (
                <div class="flex items-center justify-between p-2 rounded-lg border border-default text-sm">
                  <div class="flex items-center gap-2 truncate">
                    <RLSIcon name="link" size="xs" class="text-muted-foreground shrink-0" />
                    <span class="font-medium text-foreground truncate">{item.label}</span>
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
                      class="!text-red-500 hover:!text-red-600"
                      leading={<RLSIcon name="trash" size="xs" />}
                    />
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>

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
            <span class="text-xs font-semibold text-muted-foreground">Label</span>
            <RLSInput
              value={linkDraft().label}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setLinkDraft({ ...linkDraft(), label: e.currentTarget.value })
              }
              placeholder="e.g. GitHub Repository"
            />
          </div>

          <div class="flex flex-col gap-1">
            <span class="text-xs font-semibold text-muted-foreground">URL</span>
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
