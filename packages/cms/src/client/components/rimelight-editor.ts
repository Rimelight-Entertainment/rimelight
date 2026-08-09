import type { BaseBlock } from "../../core/types/blocks"
import { HistoryStack, createDefaultBlock } from "../state/history"
import { AutosaveController } from "../state/autosave"
import { initBlockSortable } from "../utils/sortable"

export interface RimelightBlockElement extends HTMLElement {
  setBlock: (block: BaseBlock, sectionDepth?: number) => void
}

declare global {
  interface HTMLElementTagNameMap {
    "rimelight-block": RimelightBlockElement
  }
}

export class RimelightEditor extends HTMLElement {
  private blocks: BaseBlock[] = []
  private historyStack!: HistoryStack
  private autosaveController!: AutosaveController
  private containerEl!: HTMLDivElement
  private pickerEl: any = null

  static get observedAttributes() {
    return ["page-id"]
  }

  connectedCallback() {
    this.classList.add(
      "flex",
      "flex-col",
      "flex-1",
      "w-full",
      "h-full",
      "cms-editor-pane",
      "bg-gray-900"
    )
    this.initAutosave()
    this.render()
    this.setupShortcuts()
    this.setupEventListeners()
  }

  attributeChangedCallback(name: string, _oldVal: string, newVal: string) {
    if (name === "page-id" && newVal && newVal !== "default-page") {
      this.initAutosave()
    }
  }

  private initAutosave() {
    const pageId = this.getAttribute("page-id") || "default-page"
    this.historyStack = new HistoryStack(this.blocks)
    this.autosaveController = new AutosaveController({
      pageId,
      onStatusChange: (status) => this.notifyStatusChange(status)
    })
  }

  setBlocks(initialBlocks: BaseBlock[]) {
    this.historyStack?.pause()
    this.blocks = initialBlocks ? JSON.parse(JSON.stringify(initialBlocks)) : []
    this.historyStack = new HistoryStack(this.blocks)
    this.renderCanvas()
  }

  getBlocks(): BaseBlock[] {
    return this.blocks
  }

  async getBlocksAsync(): Promise<BaseBlock[]> {
    return this.blocks
  }

  undo() {
    const prev = this.historyStack.undo()
    if (prev) {
      this.blocks = prev
      this.renderCanvas()
      this.notifyChange()
    }
  }

  redo() {
    const next = this.historyStack.redo()
    if (next) {
      this.blocks = next
      this.renderCanvas()
      this.notifyChange()
    }
  }

  addBlock(_type: BaseBlock["type"] = "ParagraphBlock") {
    this.openBlockPicker(null, "after")
  }

  async saveDraft() {
    this.autosaveController.notifyChange({ blocks: this.blocks })
  }

  private render() {
    this.innerHTML = `
      <div class="cms-block-canvas flex-1 overflow-y-auto w-full px-6 py-6" id="cms-canvas-scroll">
        <div id="cms-canvas" class="w-full min-h-[50vh]"></div>
        <div id="cms-footer" class="w-full mt-4"></div>
      </div>
    `

    const canvas = this.querySelector("#cms-canvas")
    if (canvas instanceof HTMLDivElement) {
      this.containerEl = canvas
    }

    // Create picker instance
    if (!this.pickerEl) {
      this.pickerEl = document.createElement("rimelight-block-picker")
      this.appendChild(this.pickerEl)
    }

    this.renderCanvas()
  }

  private renderCanvas() {
    if (!this.containerEl) return
    this.containerEl.innerHTML = ""

    const footer = this.querySelector("#cms-footer")
    if (footer) footer.innerHTML = ""

    if (this.blocks.length === 0) {
      this.containerEl.innerHTML = `
        <div class="cms-empty-state flex flex-col items-center justify-center py-16 text-center h-full">
          <div class="text-4xl mb-3">📄</div>
          <h4 class="text-sm font-medium text-gray-400">No blocks yet</h4>
          <p class="text-xs text-gray-600 mt-1 mb-4">Start building your page</p>
          <button class="cms-add-first-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg cursor-pointer transition-colors">+ Add Block</button>
        </div>
      `
      const addBtn = this.containerEl.querySelector(".cms-add-first-block")
      if (addBtn) {
        addBtn.addEventListener("click", () => this.openBlockPicker(null, "after"))
      }
      return
    }

    this.blocks.forEach((block) => {
      const blockEl = document.createElement("rimelight-block")
      this.containerEl.appendChild(blockEl)
      blockEl.setBlock(block, 0)
    })

    if (footer) {
      footer.innerHTML = `
        <div class="cms-add-block-footer flex items-center justify-center py-4">
          <button class="cms-add-block-btn flex items-center gap-2 px-4 py-2 border border-dashed border-gray-700 hover:border-blue-500 text-gray-500 hover:text-blue-400 text-xs rounded-lg cursor-pointer transition-colors">
            + Add Block
          </button>
        </div>
      `
      const fBtn = footer.querySelector(".cms-add-block-btn")
      if (fBtn) {
        fBtn.addEventListener("click", () => this.openBlockPicker(null, "after"))
      }
    }

    initBlockSortable(this.containerEl, {
      handle: ".cms-grip-btn",
      filter: ".cms-empty-state, .locked",
      onReorder: (oldIdx, newIdx) => {
        const item = this.blocks.splice(oldIdx, 1)[0]
        if (item) {
          this.blocks.splice(newIdx, 0, item)
          this.notifyChange(true)
        }
      },
      onAdd: () => {
        this.syncBlocksFromDom()
      },
      onRemove: () => {
        this.syncBlocksFromDom()
        if (this.blocks.length === 0) {
          this.renderCanvas()
        }
      }
    })
  }

  private syncBlocksFromDom(): void {
    const blockElements = Array.from(
      this.containerEl.querySelectorAll(":scope > rimelight-block")
    ) as any[]
    const newBlocks: BaseBlock[] = []
    blockElements.forEach((el) => {
      if (el.blockData) {
        newBlocks.push(el.blockData)
      }
    })
    this.blocks = newBlocks
    this.notifyChange(true)
  }

  private setupEventListeners() {
    this.addEventListener("block-picker-request", (e: Event) => {
      if (e instanceof CustomEvent) {
        this.openBlockPicker(e.detail.targetId, e.detail.position)
      }
    })

    this.addEventListener("block-change", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.block) {
        const updatedBlock: BaseBlock = e.detail.block
        const idx = this.blocks.findIndex((b) => b.id === updatedBlock.id)
        if (idx !== -1) {
          this.blocks[idx] = updatedBlock
          this.notifyChange()
        }
      }
    })

    this.addEventListener("block-delete", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.id) {
        const id: string = e.detail.id
        this.blocks = this.blocks.filter((b) => b.id !== id)
        this.notifyChange(true)
        this.renderCanvas()
      }
    })

    this.addEventListener("block-move", (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        const { id, direction } = e.detail
        const idx = this.blocks.findIndex((b) => b.id === id)
        const newIdx = idx + direction
        if (idx !== -1 && newIdx >= 0 && newIdx < this.blocks.length) {
          const item = this.blocks.splice(idx, 1)[0]!
          this.blocks.splice(newIdx, 0, item)
          this.notifyChange(true)
          this.renderCanvas()
        }
      }
    })

    this.addEventListener("block-duplicate", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.id) {
        const idx = this.blocks.findIndex((b) => b.id === e.detail.id)
        if (idx !== -1) {
          const clone: BaseBlock = JSON.parse(JSON.stringify(this.blocks[idx]))
          clone.id =
            typeof crypto !== "undefined" && crypto.randomUUID
              ? crypto.randomUUID()
              : Math.random().toString(36).slice(2)
          this.blocks.splice(idx + 1, 0, clone)
          this.notifyChange(true)
          this.renderCanvas()
        }
      }
    })

    this.addEventListener("block-add-adjacent", (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        this.openBlockPicker(e.detail.id, e.detail.position)
      }
    })
  }

  private openBlockPicker(targetId: string | null, position: "before" | "after") {
    if (!this.pickerEl) return
    this.pickerEl.setAttribute("section-depth", "0")

    const handleSelection = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.type) {
        this.insertBlock(e.detail.type, targetId, position)
        this.pickerEl.removeEventListener("block-type-selected", handleSelection)
      }
    }

    this.pickerEl.addEventListener("block-type-selected", handleSelection)

    if (typeof this.pickerEl.open === "function") {
      this.pickerEl.open(targetId, position)
    }
  }

  private insertBlock(type: string, targetId: string | null, position: "before" | "after"): void {
    const newBlock = createDefaultBlock(type)
    if (!targetId) {
      this.blocks.push(newBlock)
    } else {
      const idx = this.blocks.findIndex((b) => b.id === targetId)
      if (idx !== -1) {
        this.blocks.splice(position === "after" ? idx + 1 : idx, 0, newBlock)
      } else {
        this.blocks.push(newBlock)
      }
    }
    this.notifyChange(true)
    this.renderCanvas()
  }

  private notifyChange(immediate = false) {
    this.historyStack.push(this.blocks, immediate)
    this.autosaveController.notifyChange({ blocks: this.blocks })
    this.dispatchEvent(
      new CustomEvent("editor-change", { detail: { blocks: this.blocks }, bubbles: true })
    )
  }

  private notifyStatusChange(status: string) {
    this.dispatchEvent(new CustomEvent("status-change", { detail: { status }, bubbles: true }))
  }

  private setupShortcuts() {
    window.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        this.undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        this.redo()
      }
    })
  }
}

if (!customElements.get("rimelight-editor")) {
  customElements.define("rimelight-editor", RimelightEditor)
}
