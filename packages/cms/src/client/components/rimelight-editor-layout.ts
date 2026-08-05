import type { BaseBlock } from "../../core/types/blocks"
import { initSplitPane } from "../utils/splitpane"

void import("./rimelight-contenteditable")
void import("./rimelight-block")
void import("./rimelight-preview")
void import("./rimelight-editor")

interface RimelightEditorElement extends HTMLElement {
  setBlocks(blocks: BaseBlock[]): void
  getBlocks(): BaseBlock[]
}

interface RimelightPreviewElement extends HTMLElement {
  setBlocks(blocks: BaseBlock[]): void
}

export class RimelightEditorLayout extends HTMLElement {
  private editorEl!: RimelightEditorElement
  private previewEl!: RimelightPreviewElement

  connectedCallback() {
    this.className = "rimelight-cms-editor-container"
    this.innerHTML = `
      <div class="cms-split-layout" id="cms-layout">
        <rimelight-editor id="cms-editor-component"></rimelight-editor>
        <div class="cms-resize-handle" id="cms-resize-handle"></div>
        <rimelight-preview id="cms-preview-component"></rimelight-preview>
      </div>
    `

    const container = this.querySelector("#cms-layout")
    this.editorEl = this.querySelector("#cms-editor-component") as unknown as HTMLElement &
      RimelightEditorElement
    this.previewEl = this.querySelector("#cms-preview-component") as unknown as HTMLElement &
      RimelightPreviewElement
    const handle = this.querySelector("#cms-resize-handle")

    if (container && this.editorEl && this.previewEl && handle) {
      initSplitPane(container as HTMLElement, this.editorEl, this.previewEl, handle as HTMLElement)
    }

    this.editorEl.addEventListener("editor-change", (e: Event) => {
      const customEvt = e as unknown as { detail: { blocks: BaseBlock[] } }
      const blocks: BaseBlock[] = customEvt.detail.blocks
      this.previewEl.setBlocks(blocks)
    })

    // Load initial blocks from attribute
    const initialBlocksAttr = this.getAttribute("initial-blocks")
    if (initialBlocksAttr) {
      try {
        const initialBlocks = JSON.parse(initialBlocksAttr)
        this.setInitialBlocks(initialBlocks)
      } catch (e) {
        console.error("Failed to parse initial blocks:", e)
      }
    }
  }

  setInitialBlocks(blocks: BaseBlock[]) {
    if (this.editorEl && this.editorEl.setBlocks) {
      this.editorEl.setBlocks(blocks)
    }
    if (this.previewEl && this.previewEl.setBlocks) {
      this.previewEl.setBlocks(blocks)
    }
  }

  async getBlocks(): Promise<BaseBlock[]> {
    if (this.editorEl && this.editorEl.getBlocks) {
      return this.editorEl.getBlocks()
    }
    return []
  }
}

if (!customElements.get("rimelight-editor-layout")) {
  customElements.define("rimelight-editor-layout", RimelightEditorLayout)
}

export { RimelightEditorLayout }
