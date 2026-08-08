import type { BaseBlock } from "../../core/types/blocks"
import { HistoryStack } from "../state/history"
import { AutosaveController } from "../state/autosave"
import { initBlockSortable } from "../utils/sortable"

export interface RimelightBlockElement extends HTMLElement {
  setBlock: (block: BaseBlock) => void
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

  static get observedAttributes() {
    return ["page-id"]
  }

  connectedCallback() {
    this.initAutosave()
    this.classList.add("cms-editor-pane", "flex-1", "w-full", "h-full", "flex", "flex-col")
    this.render()
    this.setupShortcuts()
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

  addBlock(type: BaseBlock["type"] = "ParagraphBlock") {
    const newBlock: BaseBlock = {
      id: crypto.randomUUID(),
      type,
      props: { text: { en: "" } }
    }
    this.blocks.push(newBlock)
    this.notifyChange(true)
    this.renderCanvas()
  }

  async saveDraft() {
    this.autosaveController.notifyChange({ blocks: this.blocks })
  }

  private render() {
    this.innerHTML = `<div class="cms-block-canvas flex-1 overflow-y-auto w-full" id="cms-canvas"></div>`

    const canvas = this.querySelector("#cms-canvas")
    if (canvas instanceof HTMLDivElement) {
      this.containerEl = canvas
    }

    this.renderCanvas()
  }

  private renderCanvas() {
    if (!this.containerEl) return
    this.containerEl.innerHTML = ""

    this.blocks.forEach((block) => {
      const blockEl = document.createElement("rimelight-block")
      this.containerEl.appendChild(blockEl)
      blockEl.setBlock(block)
    })

    this.containerEl.addEventListener("block-change", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.block) {
        const updatedBlock: BaseBlock = e.detail.block
        const idx = this.blocks.findIndex((b) => b.id === updatedBlock.id)
        if (idx !== -1) {
          this.blocks[idx] = updatedBlock
          this.notifyChange()
        }
      }
    })

    this.containerEl.addEventListener("block-delete", (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.id) {
        const id: string = e.detail.id
        this.blocks = this.blocks.filter((b) => b.id !== id)
        this.notifyChange(true)
        this.renderCanvas()
      }
    })

    initBlockSortable(this.containerEl, {
      onReorder: (oldIdx, newIdx) => {
        const item = this.blocks.splice(oldIdx, 1)[0]
        if (item) {
          this.blocks.splice(newIdx, 0, item)
          this.notifyChange(true)
        }
      }
    })
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
