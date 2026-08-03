import type { BaseBlock } from "../../core/types/blocks"

export class RimelightPreview extends HTMLElement {
  private blocks: BaseBlock[] = []

  connectedCallback() {
    this.className = "cms-preview-pane p-6 overflow-y-auto"
    this.render()
  }

  setBlocks(blocks: BaseBlock[]) {
    this.blocks = blocks
    this.render()
  }

  private render() {
    this.innerHTML = `
      <div class="text-xs text-gray-500 font-semibold mb-4 uppercase tracking-wider border-b border-gray-800 pb-2">
        Live Reader Preview (SSR Sim)
      </div>
      <div class="cms-preview-content space-y-4">
        ${this.blocks.map((b) => this.renderBlockPreview(b)).join("")}
      </div>
    `
  }

  private renderBlockPreview(b: BaseBlock): string {
    const rawText = b.props.text
    const textVal = typeof rawText === "object" ? rawText.en || "" : rawText || ""

    if (b.type === "ParagraphBlock") {
      return `<p class="text-gray-200 text-base leading-relaxed my-2">${escapeHtml(textVal)}</p>`
    }
    if (b.type === "CalloutBlock") {
      return `<div class="p-4 bg-blue-950/40 border-l-4 border-blue-500 rounded text-blue-200 my-2">${escapeHtml(textVal)}</div>`
    }
    if (b.type === "CodeBlock") {
      return `<pre class="bg-gray-950 p-4 rounded text-sm text-gray-300 font-mono my-2"><code>${escapeHtml(b.props.code || textVal)}</code></pre>`
    }
    return `<div class="p-3 bg-gray-900 border border-gray-800 rounded text-sm text-gray-400 my-2">${b.type}: ${escapeHtml(textVal)}</div>`
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

if (!customElements.get("rimelight-preview")) {
  customElements.define("rimelight-preview", RimelightPreview)
}

export { RimelightPreview }
