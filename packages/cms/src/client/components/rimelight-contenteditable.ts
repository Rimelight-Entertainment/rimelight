import type { InlineNode, TextInlineNode, LinkInlineNode } from "../../core/types/inline"

export class RimelightContentEditable extends HTMLElement {
  private editorEl!: HTMLDivElement
  private readOnly = false
  private internalChange = false

  connectedCallback() {
    if (this.querySelector(".cms-contenteditable")) return

    this.readOnly = this.hasAttribute("read-only")
    this.editorEl = document.createElement("div")
    this.editorEl.className = "cms-contenteditable min-h-[60px] p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    this.editorEl.contentEditable = this.readOnly ? "false" : "true"

    this.appendChild(this.editorEl)

    this.editorEl.addEventListener("input", () => this.handleInput())
    this.editorEl.addEventListener("paste", (e) => this.handlePaste(e))
    this.editorEl.addEventListener("keydown", (e) => this.handleKeydown(e))
    this.editorEl.addEventListener("beforeinput", (e) => this.handleBeforeInput(e))
  }

  setNodes(nodes: InlineNode[]) {
    if (this.editorEl) {
      this.internalChange = true
      this.editorEl.innerHTML = this.renderNodesToHtml(nodes)
      this.internalChange = false
    }
  }

  getNodes(): InlineNode[] {
    return this.parseHtmlToNodes()
  }

  private handleInput() {
    if (this.internalChange) return
    
    const updated = this.getNodes()
    this.dispatchEvent(
      new CustomEvent("nodes-change", { detail: { nodes: updated }, bubbles: true })
    )
  }

  private handleBeforeInput(e: InputEvent) {
    // Handle rich text formatting shortcuts
    if (e.inputType === "insertText" && e.data) {
      const selection = window.getSelection()
      if (!selection || !selection.rangeCount) return

      const range = selection.getRangeAt(0)
      const textBefore = range.startContainer.textContent?.slice(0, range.startOffset) || ""
      
      // Markdown-style shortcuts
      if (textBefore.endsWith("**")) {
        e.preventDefault()
        this.execFormat("bold")
      } else if (textBefore.endsWith("*")) {
        e.preventDefault()
        this.execFormat("italic")
      } else if (textBefore.endsWith("`")) {
        e.preventDefault()
        this.execFormat("code")
      }
    }
  }

  private handleKeydown(e: KeyboardEvent) {
    // Handle keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      this.execFormat("bold")
    } else if ((e.ctrlKey || e.metaKey) && e.key === "i") {
      e.preventDefault()
      this.execFormat("italic")
    } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault()
      this.insertLink()
    }
  }

  private handlePaste(e: ClipboardEvent) {
    e.preventDefault()
    const text = e.clipboardData?.getData("text/plain") || ""
    const html = e.clipboardData?.getData("text/html") || ""
    
    if (html) {
      // Clean HTML and paste as plain text to avoid security issues
      const cleanText = this.stripHtml(html)
      document.execCommand("insertText", false, cleanText)
    } else {
      document.execCommand("insertText", false, text)
    }
  }

  private execFormat(command: string) {
    document.execCommand(command, false)
    this.handleInput()
  }

  private insertLink() {
    const selection = window.getSelection()
    if (!selection || !selection.rangeCount) return

    const url = prompt("Enter URL:")
    if (url) {
      document.execCommand("createLink", false, url)
      this.handleInput()
    }
  }

  private stripHtml(html: string): string {
    const div = document.createElement("div")
    div.innerHTML = html
    return div.textContent || div.innerText || ""
  }

  private renderNodesToHtml(nodes: InlineNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === "text") {
          let str = escapeHtml(node.text)
          if (node.marks?.includes("bold")) str = `<strong>${str}</strong>`
          if (node.marks?.includes("italic")) str = `<em>${str}</em>`
          if (node.marks?.includes("underline")) str = `<u>${str}</u>`
          if (node.marks?.includes("strikethrough")) str = `<s>${str}</s>`
          if (node.marks?.includes("code")) str = `<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">${str}</code>`
          return str
        }
        if (node.type === "link") {
          const linkText = node.children && node.children.length > 0 
            ? this.renderNodesToHtml(node.children)
            : escapeHtml(node.url)
          const target = node.openInNewTab ? '_blank' : '_self'
          return `<a href="${escapeHtml(node.url)}" target="${target}" rel="noopener noreferrer" class="text-blue-600 hover:underline">${linkText}</a>`
        }
        if (node.type === "page_mention") {
          return `<span class="cms-page-mention bg-blue-100 text-blue-800 px-2 py-0.5 rounded cursor-pointer" data-page-id="${node.pageId}">@${escapeHtml(node.displayTitle || node.pageSlug)}</span>`
        }
        return ""
      })
      .join("")
  }

  private parseHtmlToNodes(): InlineNode[] {
    if (!this.editorEl) return []

    const nodes: InlineNode[] = []
    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ""
        if (text.trim()) {
          nodes.push({ type: "text", text })
        }
        return
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        
        // Handle links
        if (el.tagName === "A") {
          const href = el.getAttribute("href") || ""
          const target = el.getAttribute("target") === "_blank"
          const children = this.parseChildrenToNodes(el)
          nodes.push({
            type: "link",
            url: href,
            openInNewTab: target,
            children
          })
          return
        }

        // Handle page mentions
        if (el.classList.contains("cms-page-mention")) {
          const pageId = el.getAttribute("data-page-id") || ""
          const displayTitle = el.textContent?.replace("@", "") || ""
          nodes.push({
            type: "page_mention",
            pageId,
            pageSlug: displayTitle,
            displayTitle
          })
          return
        }

        // Handle formatting (bold, italic, etc.)
        const tagName = el.tagName.toLowerCase()
        const marks: Array<"bold" | "italic" | "underline" | "strikethrough" | "code"> = []
        
        if (tagName === "strong" || tagName === "b") marks.push("bold")
        if (tagName === "em" || tagName === "i") marks.push("italic")
        if (tagName === "u") marks.push("underline")
        if (tagName === "s" || tagName === "strike") marks.push("strikethrough")
        if (tagName === "code") marks.push("code")

        const children = this.parseChildrenToNodes(el)
        
        // Apply marks to text children
        children.forEach(child => {
          if (child.type === "text" && marks.length > 0) {
            nodes.push({ ...child, marks: [...(child.marks || []), ...marks] })
          } else {
            nodes.push(child)
          }
        })
      }
    }

    Array.from(this.editorEl.childNodes).forEach(walk)
    return nodes
  }

  private parseChildrenToNodes(el: HTMLElement): InlineNode[] {
    const nodes: InlineNode[] = []
    Array.from(el.childNodes).forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent || ""
        if (text.trim()) {
          nodes.push({ type: "text", text })
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Simple recursive parsing for nested elements
        const childEl = child as HTMLElement
        const tagName = childEl.tagName.toLowerCase()
        
        if (tagName === "strong" || tagName === "b") {
          const text = childEl.textContent || ""
          if (text) nodes.push({ type: "text", text, marks: ["bold"] })
        } else if (tagName === "em" || tagName === "i") {
          const text = childEl.textContent || ""
          if (text) nodes.push({ type: "text", text, marks: ["italic"] })
        } else {
          const text = childEl.textContent || ""
          if (text) nodes.push({ type: "text", text })
        }
      }
    })
    return nodes
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

if (!customElements.get("rimelight-contenteditable")) {
  customElements.define("rimelight-contenteditable", RimelightContentEditable)
}

export { RimelightContentEditable }