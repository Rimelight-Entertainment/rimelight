import type { BaseBlock } from "../../core/types/blocks"

export class RimelightBlockNode extends HTMLElement {
  private blockData!: BaseBlock
  private isLocked = false

  connectedCallback() {
    this.render()
  }

  setBlock(block: BaseBlock, isLocked = false) {
    this.blockData = block
    this.isLocked = isLocked
    this.render()
  }

  private render() {
    if (!this.blockData) return

    const isTemplated = !!this.blockData.isTemplated
    const lockedProps = this.blockData.templatedProps
    const readOnly = this.isLocked || isTemplated || lockedProps === true

    this.className = `cms-block-node ${readOnly ? "locked" : ""}`

    let lockBadgeHtml = ""
    if (this.isLocked) {
      lockBadgeHtml = `<div class="cms-block-lock-overlay">🔒 Restricted Block (Read-only)</div>`
    } else if (isTemplated) {
      lockBadgeHtml = `<div class="cms-block-lock-overlay">🔒 Template Anchor (Permanent)</div>`
    }

    const typeHtml = `<div class="text-xs text-gray-400 font-semibold mb-2 uppercase flex items-center justify-between">
      <span>${this.blockData.type}</span>
      ${!readOnly ? `<button class="cms-delete-btn text-red-400 hover:text-red-300 text-xs cursor-pointer">Delete</button>` : ""}
    </div>`

    const rawText = this.blockData.props.text
    const textVal = typeof rawText === "object" ? rawText.en || "" : rawText || ""

    this.innerHTML = `
      ${lockBadgeHtml}
      ${typeHtml}
      <rimelight-contenteditable ${readOnly ? "read-only" : ""}></rimelight-contenteditable>
    `

    const ce = this.querySelector("rimelight-contenteditable")
    if (ce) {
      const contentEditable = ce as unknown as {
        setNodes: (nodes: Array<{ type: string; text: string }>) => void
      }
      contentEditable.setNodes([{ type: "text", text: textVal }])
      ce.addEventListener("nodes-change", (e: Event) => {
        const customEvt = e as unknown as { detail: { nodes: Array<{ text?: string }> } }
        const text = customEvt.detail.nodes[0]?.text || ""
        this.blockData.props.text = { en: text }
        this.dispatchEvent(
          new CustomEvent("block-change", { detail: { block: this.blockData }, bubbles: true })
        )
      })
    }

    const delBtn = this.querySelector(".cms-delete-btn")
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-delete", { detail: { id: this.blockData.id }, bubbles: true })
        )
      })
    }
  }
}

if (!customElements.get("rimelight-block")) {
  customElements.define("rimelight-block", RimelightBlockNode)
}
