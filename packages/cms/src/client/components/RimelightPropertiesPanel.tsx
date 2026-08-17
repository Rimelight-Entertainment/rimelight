import { createSignal, onMount, For, type Component } from "solid-js"
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
  onPropertiesChange?: (props: Record<string, any>) => void
  class?: string
}

export const RimelightPropertiesPanel: Component<RimelightPropertiesPanelProps> = (
  componentProps
) => {
  const pageType = () => componentProps.pageType || "Default"
  const definition = (): PageDefinition | null => getPageDefinition(pageType())

  const [properties, setProperties] = createSignal<Record<string, any>>(
    componentProps.initialProperties || {}
  )
  const [expandedGroups, setExpandedGroups] = createSignal<Record<string, boolean>>({})
  const [arrayInputs, setArrayInputs] = createSignal<Record<string, string>>({})

  onMount(() => {
    const def = definition()
    if (def?.properties) {
      const initialExpanded: Record<string, boolean> = {}
      Object.entries(def.properties).forEach(([groupId, group]) => {
        initialExpanded[groupId] = group.defaultOpen ?? true
      })
      setExpandedGroups(initialExpanded)
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

  const renderField = (fieldId: string, field: FieldDefinition) => {
    const label = getTextValue(field.label)
    const value = properties()[fieldId] !== undefined ? properties()[fieldId] : field.defaultValue

    if (field.type === "text") {
      return (
        <div class="cms-field">
          <label class="block text-xs text-gray-500 mb-1">{label}</label>
          <input
            type="text"
            data-field={fieldId}
            value={getTextValue(value)}
            onInput={(e) => handlePropertyChange(fieldId, e.currentTarget.value)}
            class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      )
    }

    if (field.type === "number") {
      return (
        <div class="cms-field">
          <label class="block text-xs text-gray-500 mb-1">{label}</label>
          <input
            type="number"
            data-field={fieldId}
            value={value !== undefined ? String(value) : ""}
            onInput={(e) => handlePropertyChange(fieldId, Number(e.currentTarget.value))}
            class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      )
    }

    if (field.type === "enum") {
      return (
        <div class="cms-field">
          <label class="block text-xs text-gray-500 mb-1">{label}</label>
          <select
            data-field={fieldId}
            value={getTextValue(value)}
            onChange={(e) => handlePropertyChange(fieldId, e.currentTarget.value)}
            class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 appearance-none"
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
        <div class="cms-field">
          <label class="block text-xs text-gray-500 mb-1">{label}</label>
          <div class="cms-array-container flex flex-wrap gap-1 mb-1">
            <For each={arr}>
              {(item, idx) => (
                <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-200 text-xs rounded-full">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx())}
                    class="cms-array-remove ml-1 text-gray-400 hover:text-red-400 cursor-pointer"
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
              class="flex-1 bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
              placeholder="Add item..."
            />
            <button
              type="button"
              onClick={addArrayItem}
              class="cms-array-add px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
            >
              +
            </button>
          </div>
        </div>
      )
    }

    if (field.type === "page") {
      return (
        <div class="cms-field">
          <label class="block text-xs text-gray-500 mb-1">{label}</label>
          <input
            type="text"
            data-field={fieldId}
            value={getTextValue(value)}
            onInput={(e) => handlePropertyChange(fieldId, e.currentTarget.value)}
            placeholder="Page slug or ID"
            class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
      )
    }

    return <div class="text-xs text-gray-500">Unsupported field type: {field.type}</div>
  }

  return (
    <div
      id="cms-properties-panel"
      class="cms-properties-panel h-full flex flex-col bg-gray-900 border-l border-gray-800"
    >
      <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Properties</span>
        <span class="text-xs text-gray-500">{pageType()}</span>
      </div>

      {!definition() ? (
        <div class="p-4 text-sm text-gray-500">No properties defined for this page type.</div>
      ) : (
        <div class="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          <For each={Object.entries(definition()?.properties || {})}>
            {([groupId, group]) => {
              const isExpanded = () => expandedGroups()[groupId] ?? true
              return (
                <div class="cms-prop-group" data-group-id={groupId}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    class="cms-group-header flex items-center justify-between w-full py-2 text-left"
                    aria-expanded={isExpanded()}
                  >
                    <span class="text-xs font-semibold text-gray-300">
                      {getTextValue(group.label)}
                    </span>
                    <span
                      class="chevron text-gray-500 text-xs transition-transform duration-200"
                      classList={{ "-rotate-90": !isExpanded() }}
                    >
                      ▼
                    </span>
                  </button>

                  {isExpanded() && (
                    <div class="cms-group-body space-y-3 pb-2">
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
      )}
    </div>
  )
}
