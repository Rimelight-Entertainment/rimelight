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

  connectedCallback() {
    const pageId = this.getAttribute("page-id") || "default-page"
    this.historyStack = new HistoryStack(this.blocks)
    this.autosaveController = new AutosaveController({
      pageId,
      onStatusChange: (status) => this.updateStatusBadge(status)
    })

    this.className = "cms-editor-pane"
    this.render()
    this.setupShortcuts()
  }

  setBlocks(initialBlocks: BaseBlock[]) {
    this.blocks = JSON.parse(JSON.stringify(initialBlocks))
    this.historyStack = new HistoryStack(this.blocks)
    this.renderCanvas()
  }

  getBlocks(): BaseBlock[] {
    return this.blocks
  }

  async getBlocksAsync(): Promise<BaseBlock[]> {
    return this.blocks
  }

  private render() {
    this.innerHTML = `
      <div class="cms-editor-header">
        <div class="flex items-center gap-3">
          <span class="font-bold text-sm text-gray-200">Editor</span>
          <span id="cms-status-badge" class="cms-status-badge cms-status-saved">● Saved</span>
        </div>
        <div class="flex items-center gap-2">
          <button id="cms-undo-btn" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded text-gray-300">Undo (Ctrl+Z)</button>
          <button id="cms-redo-btn" class="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-xs rounded text-gray-300">Redo (Ctrl+Y)</button>
          <button id="cms-add-block-btn" class="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded text-white">+ Add Block</button>
        </div>
      </div>
      <div class="cms-block-canvas" id="cms-canvas"></div>
    `

    const canvas = this.querySelector("#cms-canvas")
    if (canvas instanceof HTMLDivElement) {
      this.containerEl = canvas
    }

    this.querySelector("#cms-undo-btn")?.addEventListener("click", () => this.undo())
    this.querySelector("#cms-redo-btn")?.addEventListener("click", () => this.redo())
    this.querySelector("#cms-add-block-btn")?.addEventListener("click", () =>
      this.addParagraphBlock()
    )

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

  private addParagraphBlock() {
    const newBlock: BaseBlock = {
      id: crypto.randomUUID(),
      type: "ParagraphBlock",
      props: { text: { en: "New paragraph content..." } }
    }
    this.blocks.push(newBlock)
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

  private undo() {
    const prev = this.historyStack.undo()
    if (prev) {
      this.blocks = prev
      this.renderCanvas()
      this.dispatchEvent(
        new CustomEvent("editor-change", { detail: { blocks: this.blocks }, bubbles: true })
      )
    }
  }

  private redo() {
    const next = this.historyStack.redo()
    if (next) {
      this.blocks = next
      this.renderCanvas()
      this.dispatchEvent(
        new CustomEvent("editor-change", { detail: { blocks: this.blocks }, bubbles: true })
      )
    }
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

  private updateStatusBadge(status: string) {
    const badge = this.querySelector("#cms-status-badge")
    if (!badge) return
    badge.className = `cms-status-badge cms-status-${status}`
    badge.textContent =
      status === "saved"
        ? "● Saved"
        : status === "unsaved"
          ? "▲ Unsaved Changes"
          : status === "saving"
            ? "↻ Saving..."
            : "✖ Save Failed"
  }
}

if (!customElements.get("rimelight-editor")) {
  customElements.define("rimelight-editor", RimelightEditor)
}
