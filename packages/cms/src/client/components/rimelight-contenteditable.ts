import type { InlineNode } from "../../core/types/inline"

export class RimelightContentEditable extends HTMLElement {
  private editorEl!: HTMLDivElement
  private readOnly = false

  connectedCallback() {
    if (this.querySelector(".cms-contenteditable")) return

    this.readOnly = this.hasAttribute("read-only")
    this.editorEl = document.createElement("div")
    this.editorEl.className = "cms-contenteditable"
    this.editorEl.contentEditable = this.readOnly ? "false" : "true"

    this.appendChild(this.editorEl)

    this.editorEl.addEventListener("input", () => this.handleInput())
    this.editorEl.addEventListener("paste", (e) => this.handlePaste(e))
  }

  setNodes(nodes: InlineNode[]) {
    if (this.editorEl) {
      this.editorEl.innerHTML = this.renderNodesToHtml(nodes)
    }
  }

  getNodes(): InlineNode[] {
    return this.parseHtmlToNodes()
  }

  private handleInput() {
    const updated = this.getNodes()
    this.dispatchEvent(
      new CustomEvent("nodes-change", { detail: { nodes: updated }, bubbles: true })
    )
  }

  private handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData("text/plain") || ""
    document.execCommand("insertText", false, text)
  }

  private renderNodesToHtml(nodes: InlineNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === "text") {
          let str = escapeHtml(node.text)
          if (node.marks?.includes("bold")) str = `<strong>${str}</strong>`
          if (node.marks?.includes("italic")) str = `<em>${str}</em>`
          if (node.marks?.includes("code")) str = `<code>${str}</code>`
          return str
        }
        if (node.type === "link") {
          return `<a href="${escapeHtml(node.url)}" target="_blank" rel="noopener">${escapeHtml(node.children[0]?.text || node.url)}</a>`
        }
        if (node.type === "page_mention") {
          return `<span class="cms-page-mention" data-page-id="${node.pageId}">@${escapeHtml(node.displayTitle || node.pageSlug)}</span>`
        }
        return ""
      })
      .join("")
  }

  private parseHtmlToNodes(): InlineNode[] {
    const text = this.editorEl?.innerText || ""
    return [{ type: "text", text }]
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

if (!customElements.get("rimelight-contenteditable")) {
  customElements.define("rimelight-contenteditable", RimelightContentEditable)
}
