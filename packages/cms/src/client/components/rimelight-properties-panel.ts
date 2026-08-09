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

export class RimelightPropertiesPanel extends HTMLElement {
  private pageType: string = "Default"
  private properties: Record<string, any> = {}
  private definition: PageDefinition | null = null

  static get observedAttributes() {
    return ["page-type", "initial-properties"]
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    if (name === "page-type") {
      this.pageType = newValue || "Default"
      this.definition = getPageDefinition(this.pageType)
      this.render()
    }
    if (name === "initial-properties") {
      try {
        this.properties = JSON.parse(newValue || "{}")
      } catch {
        this.properties = {}
      }
      this.render()
    }
  }

  connectedCallback() {
    this.classList.add(
      "block",
      "w-72",
      "h-full",
      "shrink-0",
      "bg-gray-900",
      "border-l",
      "border-gray-800",
      "cms-properties-panel-container"
    )
    if (!this.definition) {
      this.definition = getPageDefinition(this.pageType)
    }
    this.render()
  }

  private handlePropertyChange(key: string, value: any) {
    this.properties[key] = value
    this.dispatchEvent(
      new CustomEvent("properties-change", {
        detail: { properties: this.properties },
        bubbles: true,
        composed: true
      })
    )
  }

  private render() {
    if (!this.definition) {
      this.innerHTML = `
        <div class="cms-properties-panel h-full flex flex-col bg-gray-900 border-l border-gray-800">
          <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Properties</span>
            <span class="text-xs text-gray-500">${escapeHtml(this.pageType)}</span>
          </div>
          <div class="p-4 text-sm text-gray-500">No properties defined for this page type.</div>
        </div>
      `
      return
    }

    const groupsHtml = Object.entries(this.definition.properties || {})
      .map(([groupId, group]) => {
        const isExpanded = group.defaultOpen

        const fieldsHtml = Object.entries(group.fields || {})
          .map(([fieldId, field]) => {
            const value =
              this.properties[fieldId] !== undefined ? this.properties[fieldId] : field.defaultValue
            return this.renderField(fieldId, field, value)
          })
          .join("")

        return `
        <div class="cms-prop-group" data-group-id="${escapeHtml(groupId)}">
          <button class="cms-group-header flex items-center justify-between w-full py-2 text-left" aria-expanded="${isExpanded}">
            <span class="text-xs font-semibold text-gray-300">${escapeHtml(getTextValue(group.label))}</span>
            <span class="chevron text-gray-500 text-xs transition-transform duration-200 ${isExpanded ? "" : "-rotate-90"}">▼</span>
          </button>
          <div class="cms-group-body space-y-3 pb-2 ${isExpanded ? "" : "hidden"}">
            ${fieldsHtml}
          </div>
        </div>
      `
      })
      .join("")

    this.innerHTML = `
      <div class="cms-properties-panel h-full flex flex-col bg-gray-900 border-l border-gray-800">
        <div class="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">Properties</span>
          <span class="text-xs text-gray-500">${escapeHtml(this.pageType)}</span>
        </div>
        <div class="overflow-y-auto flex-1 px-4 py-4 space-y-4">
          ${groupsHtml}
        </div>
      </div>
    `

    this.attachEventListeners()
  }

  private renderField(fieldId: string, field: FieldDefinition, value: any): string {
    const label = escapeHtml(getTextValue(field.label))
    let inputHtml = ""

    if (field.type === "text") {
      const val = escapeHtml(getTextValue(value))
      inputHtml = `<input type="text" data-field="${escapeHtml(fieldId)}" value="${val}" class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500">`
    } else if (field.type === "number") {
      const val = value !== undefined ? value : ""
      inputHtml = `<input type="number" data-field="${escapeHtml(fieldId)}" value="${escapeHtml(String(val))}" class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500">`
    } else if (field.type === "enum") {
      const optionsHtml = (field.options || [])
        .map((opt: { en: string } | string) => {
          const optVal = getTextValue(opt)
          const isSelected = getTextValue(value) === optVal
          return `<option value="${escapeHtml(optVal)}" ${isSelected ? "selected" : ""}>${escapeHtml(optVal)}</option>`
        })
        .join("")
      inputHtml = `<select data-field="${escapeHtml(fieldId)}" class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500 appearance-none">${optionsHtml}</select>`
    } else if (field.type === "text-array" || field.type === "page-array") {
      const arr: string[] = Array.isArray(value) ? value : []
      const chipsHtml = arr
        .map(
          (item, idx) => `
        <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-700 text-gray-200 text-xs rounded-full">
          ${escapeHtml(item)}
          <button type="button" class="cms-array-remove ml-1 text-gray-400 hover:text-red-400 cursor-pointer" data-field="${escapeHtml(fieldId)}" data-index="${idx}">×</button>
        </span>
      `
        )
        .join("")
      inputHtml = `
        <div class="cms-array-container flex flex-wrap gap-1 mb-1" id="array-container-${escapeHtml(fieldId)}">
          ${chipsHtml}
        </div>
        <div class="flex gap-1 mt-1">
          <input type="text" id="array-input-${escapeHtml(fieldId)}" class="flex-1 bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500" placeholder="Add item...">
          <button type="button" class="cms-array-add px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm" data-field="${escapeHtml(fieldId)}">+</button>
        </div>
      `
    } else if (field.type === "page") {
      const val = escapeHtml(getTextValue(value))
      inputHtml = `<input type="text" data-field="${escapeHtml(fieldId)}" value="${val}" placeholder="Page slug or ID" class="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded px-2.5 py-1.5 text-sm outline-none focus:border-blue-500">`
    } else {
      inputHtml = `<div class="text-xs text-gray-500">Unsupported field type: ${escapeHtml(field.type)}</div>`
    }

    return `
      <div class="cms-field">
        <label class="block text-xs text-gray-500 mb-1">${label}</label>
        ${inputHtml}
      </div>
    `
  }

  private attachEventListeners() {
    this.querySelectorAll(".cms-group-header").forEach((header) => {
      header.addEventListener("click", (e) => {
        const btn = e.currentTarget as HTMLButtonElement
        const body = btn.nextElementSibling as HTMLElement
        const chevron = btn.querySelector(".chevron") as HTMLElement
        const isExpanded = btn.getAttribute("aria-expanded") === "true"

        btn.setAttribute("aria-expanded", String(!isExpanded))
        if (isExpanded) {
          body.classList.add("hidden")
          chevron.classList.add("-rotate-90")
        } else {
          body.classList.remove("hidden")
          chevron.classList.remove("-rotate-90")
        }
      })
    })

    this.querySelectorAll("input[data-field], select[data-field], textarea[data-field]").forEach(
      (input) => {
        input.addEventListener("change", (e) => {
          const target = e.target as HTMLInputElement | HTMLSelectElement
          const fieldId = target.getAttribute("data-field")
          if (!fieldId) return

          let val: any = target.value
          if (target.type === "number") {
            val = Number(val)
          }

          this.handlePropertyChange(fieldId, val)
        })
      }
    )

    this.querySelectorAll(".cms-array-add").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement
        const fieldId = target.getAttribute("data-field")
        if (!fieldId) return

        const input = this.querySelector(`#array-input-${fieldId}`) as HTMLInputElement
        if (!input || !input.value.trim()) return

        const currentArr = Array.isArray(this.properties[fieldId])
          ? [...this.properties[fieldId]]
          : []
        currentArr.push(input.value.trim())

        this.handlePropertyChange(fieldId, currentArr)
        this.render()
      })
    })

    this.querySelectorAll(".cms-array-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const target = e.currentTarget as HTMLButtonElement
        const fieldId = target.getAttribute("data-field")
        const indexStr = target.getAttribute("data-index")
        if (!fieldId || !indexStr) return

        const index = parseInt(indexStr, 10)
        const currentArr = Array.isArray(this.properties[fieldId])
          ? [...this.properties[fieldId]]
          : []
        currentArr.splice(index, 1)

        this.handlePropertyChange(fieldId, currentArr)
        this.render()
      })
    })
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

if (!customElements.get("rimelight-properties-panel")) {
  customElements.define("rimelight-properties-panel", RimelightPropertiesPanel)
}
