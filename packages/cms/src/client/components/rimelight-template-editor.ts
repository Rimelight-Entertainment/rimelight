import type { BaseBlock } from "../../core/types/blocks"
import { initBlockSortable } from "../utils/sortable"

export class RimelightTemplateEditor extends HTMLElement {
  private blocks: BaseBlock[] = []
  private containerEl!: HTMLDivElement

  connectedCallback() {
    this.className =
      "cms-template-editor border border-gray-300 rounded-lg p-4 bg-gray-950 text-gray-100 space-y-4"
    this.render()
  }

  setBlocks(initialBlocks: BaseBlock[]) {
    this.blocks = JSON.parse(JSON.stringify(initialBlocks))
    this.renderCanvas()
  }

  getBlocks(): BaseBlock[] {
    return this.blocks
  }

  private render() {
    this.innerHTML = `
      <div class="flex items-center justify-between bg-gray-900 p-3 rounded border border-gray-800">
        <div>
          <h4 class="text-sm font-semibold text-gray-200">Initial Template Blocks</h4>
          <p class="text-xs text-gray-400">Visually design the initial layout and set block locks for pages instantiated from this template.</p>
        </div>
        <div class="flex items-center gap-2">
          <select id="tmpl-block-type-select" class="px-2.5 py-1.5 bg-gray-800 border border-gray-700 text-xs rounded text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="ParagraphBlock">Paragraph</option>
            <option value="SectionBlock">Section Heading</option>
            <option value="CalloutBlock">Callout Box</option>
            <option value="CodeBlock">Code Snippet</option>
            <option value="ImageBlock">Image</option>
            <option value="ScriptBlock">Script</option>
            <option value="SceneBlock">Scene</option>
            <option value="DialogueBlock">Dialogue</option>
          </select>
          <button type="button" id="tmpl-add-block-btn" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-xs font-medium rounded text-white cursor-pointer">+ Add Block</button>
        </div>
      </div>
      <div id="tmpl-block-canvas" class="space-y-3 min-h-[120px] p-3 bg-gray-900/50 border border-gray-800 rounded"></div>
    `

    const canvas = this.querySelector<HTMLDivElement>("#tmpl-block-canvas")
    if (canvas) {
      this.containerEl = canvas
    }

    this.querySelector("#tmpl-add-block-btn")?.addEventListener("click", () => {
      const select = this.querySelector<HTMLSelectElement>("#tmpl-block-type-select")
      const type = select?.value || "ParagraphBlock"
      this.addBlock(type)
    })

    this.renderCanvas()
  }

  private renderCanvas() {
    if (!this.containerEl) return
    this.containerEl.innerHTML = ""

    if (this.blocks.length === 0) {
      this.containerEl.innerHTML = `
        <div class="text-center py-8 text-xs text-gray-500 italic">
          No initial blocks added yet. Use the dropdown above to add initial template blocks.
        </div>
      `
      return
    }

    this.blocks.forEach((block, index) => {
      const card = document.createElement("div")
      card.className =
        "cms-template-block-card bg-gray-900 border border-gray-800 rounded p-3 text-xs space-y-2 relative"
      card.dataset.id = block.id

      const isTemplated = !!block.isTemplated
      const isContentLocked = block.templatedProps === true

      const rawText =
        block.props.text || block.props.title || block.props.code || block.props.src || ""
      const textVal = typeof rawText === "object" ? rawText.en || "" : rawText || ""

      card.innerHTML = `
        <div class="flex items-center justify-between border-b border-gray-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-300 uppercase">${block.type}</span>
            <span class="text-[10px] text-gray-500">#${index + 1}</span>
          </div>
          <button type="button" class="tmpl-del-btn text-red-400 hover:text-red-300 text-xs font-semibold cursor-pointer">Delete</button>
        </div>

        <div class="flex items-center gap-4 py-1">
          <label class="flex items-center gap-1.5 cursor-pointer text-gray-300 select-none" title="Permanent anchor: page authors cannot delete or reorder this block">
            <input type="checkbox" class="tmpl-anchor-chk rounded text-blue-600 focus:ring-0" ${isTemplated ? "checked" : ""} />
            <span>📌 Anchor (Permanent)</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer text-gray-300 select-none" title="Content lock: page authors cannot edit this block's content">
            <input type="checkbox" class="tmpl-lock-chk rounded text-blue-600 focus:ring-0" ${isContentLocked ? "checked" : ""} />
            <span>🔒 Lock Content</span>
          </label>
        </div>

        <div>
          <label class="block text-[11px] text-gray-400 mb-1">Block Content / Text</label>
          <input type="text" class="tmpl-content-input w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded text-gray-200 text-xs focus:outline-none focus:border-blue-500" value="${escapeHtml(textVal)}" placeholder="Enter default block content..." />
        </div>
      `

      // Checkbox event handlers
      const anchorChk = card.querySelector<HTMLInputElement>(".tmpl-anchor-chk")
      anchorChk?.addEventListener("change", () => {
        block.isTemplated = anchorChk.checked
      })

      const lockChk = card.querySelector<HTMLInputElement>(".tmpl-lock-chk")
      lockChk?.addEventListener("change", () => {
        block.templatedProps = lockChk.checked
      })

      // Input event handler
      const contentInput = card.querySelector<HTMLInputElement>(".tmpl-content-input")
      contentInput?.addEventListener("input", () => {
        const text = contentInput.value
        if (block.type === "SectionBlock") {
          block.props.title = text
        } else if (block.type === "CodeBlock") {
          block.props.code = text
        } else if (block.type === "ImageBlock") {
          block.props.src = text
        } else {
          block.props.text = { en: text }
        }
      })

      // Delete handler
      card.querySelector(".tmpl-del-btn")?.addEventListener("click", () => {
        this.blocks = this.blocks.filter((b) => b.id !== block.id)
        this.renderCanvas()
      })

      this.containerEl.appendChild(card)
    })

    initBlockSortable(this.containerEl, {
      onReorder: (oldIdx, newIdx) => {
        const item = this.blocks.splice(oldIdx, 1)[0]
        if (item) {
          this.blocks.splice(newIdx, 0, item)
          this.renderCanvas()
        }
      }
    })
  }

  private addBlock(type: string) {
    let props: Record<string, any> = {}

    if (type === "SectionBlock") {
      props = { title: "Section Heading" }
    } else if (type === "CalloutBlock") {
      props = { text: { en: "Callout note content..." }, variant: "info" }
    } else if (type === "CodeBlock") {
      props = { code: "// Code snippet", language: "typescript" }
    } else if (type === "ImageBlock") {
      props = { src: "https://via.placeholder.com/600x300", alt: "Image description" }
    } else if (type === "ScriptBlock") {
      props = { title: "Scene Script" }
    } else if (type === "SceneBlock") {
      props = { heading: "INT. SCENE - DAY" }
    } else if (type === "DialogueBlock") {
      props = { character: "CHARACTER", text: { en: "Dialogue text..." } }
    } else {
      props = { text: { en: "Paragraph content..." } }
    }

    const newBlock: BaseBlock = {
      id: crypto.randomUUID(),
      type: type,
      isTemplated: false,
      props
    }

    this.blocks.push(newBlock)
    this.renderCanvas()
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

if (!customElements.get("rimelight-template-editor")) {
  customElements.define("rimelight-template-editor", RimelightTemplateEditor)
}
