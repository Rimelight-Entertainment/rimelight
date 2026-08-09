export interface InlineNode {
  type: "text" | "link"
  text?: string
  marks?: string[]
  url?: string
  children?: InlineNode[]
  openInNewTab?: boolean
}

export class ParagraphEditor extends HTMLElement {
  private props: Record<string, any> = {}
  private editableDiv!: HTMLDivElement
  private toolbarDiv!: HTMLDivElement
  private containerDiv!: HTMLDivElement

  connectedCallback() {
    if (this.childElementCount > 0) return

    this.containerDiv = document.createElement("div")
    this.containerDiv.className =
      "border border-transparent rounded-md transition-colors duration-200"

    this.toolbarDiv = document.createElement("div")
    this.toolbarDiv.className =
      "flex items-center gap-1 px-2 py-1 bg-gray-800 border-b border-gray-700 rounded-t-md hidden"
    this.toolbarDiv.innerHTML = `
      <button type="button" data-cmd="bold" class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs font-bold">B</button>
      <button type="button" data-cmd="italic" class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs italic">I</button>
      <button type="button" data-cmd="underline" class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs underline">U</button>
      <div class="w-px h-4 bg-gray-700 mx-1"></div>
      <button type="button" data-cmd="createLink" class="p-1.5 rounded text-gray-400 hover:text-gray-100 hover:bg-gray-700 cursor-pointer text-xs">Link</button>
    `

    this.editableDiv = document.createElement("div")
    this.editableDiv.contentEditable = "true"
    this.editableDiv.className =
      "p-3 outline-none min-h-[48px] text-sm text-gray-100 bg-transparent leading-relaxed"

    this.containerDiv.appendChild(this.toolbarDiv)
    this.containerDiv.appendChild(this.editableDiv)
    this.appendChild(this.containerDiv)

    this.setupListeners()
    this.renderContent()
  }

  setProps(props: Record<string, any>) {
    this.props = props || {}
    this.renderContent()
  }

  private setupListeners() {
    this.editableDiv.addEventListener("focus", () => {
      this.toolbarDiv.classList.remove("hidden")
      this.containerDiv.classList.replace("border-transparent", "border-gray-600")
      this.containerDiv.classList.add("overflow-hidden")
    })

    this.editableDiv.addEventListener("blur", () => {
      setTimeout(() => {
        if (!this.containerDiv.contains(document.activeElement)) {
          this.toolbarDiv.classList.add("hidden")
          this.containerDiv.classList.replace("border-gray-600", "border-transparent")
          this.containerDiv.classList.remove("overflow-hidden")
          this.saveProps()
        }
      }, 200)
    })

    this.toolbarDiv.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest("button")
      if (!btn) return
      e.preventDefault()

      const cmd = btn.dataset.cmd
      if (cmd === "createLink") {
        const url = prompt("Enter link URL:")
        if (url) {
          document.execCommand(cmd, false, url)
        }
      } else if (cmd) {
        document.execCommand(cmd, false)
      }
      this.editableDiv.focus()
    })

    this.editableDiv.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") {
          e.preventDefault()
          document.execCommand("bold", false)
        } else if (e.key === "i") {
          e.preventDefault()
          document.execCommand("italic", false)
        } else if (e.key === "u") {
          e.preventDefault()
          document.execCommand("underline", false)
        } else if (e.key === "k") {
          e.preventDefault()
          const url = prompt("Enter link URL:")
          if (url) document.execCommand("createLink", false, url)
        }
      }
    })

    // Markdown shortcuts
    this.editableDiv.addEventListener("input", () => {
      // Basic markdown replacement would go here. For simplicity in vanilla,
      // full real-time markdown parsing in contenteditable is complex,
      // but we could handle space-triggered replacements.
    })

    this.editableDiv.addEventListener("paste", (e) => {
      e.preventDefault()
      const text = e.clipboardData?.getData("text/plain") || ""
      document.execCommand("insertText", false, text)
    })
  }

  private renderContent() {
    if (!this.editableDiv) return
    const text = this.props.text
    if (!text) {
      this.editableDiv.innerHTML = ""
      return
    }

    if (Array.isArray(text)) {
      this.editableDiv.innerHTML = this.renderNodesToHtml(text)
    } else if (typeof text === "object" && text.en) {
      this.editableDiv.innerText = text.en
    } else {
      this.editableDiv.innerText = String(text)
    }
  }

  private renderNodesToHtml(nodes: InlineNode[]): string {
    return nodes
      .map((node) => {
        if (node.type === "text") {
          let text = node.text || ""
          text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          if (node.marks) {
            if (node.marks.includes("bold")) text = `<strong>${text}</strong>`
            if (node.marks.includes("italic")) text = `<em>${text}</em>`
            if (node.marks.includes("underline")) text = `<u>${text}</u>`
            if (node.marks.includes("strikethrough")) text = `<s>${text}</s>`
            if (node.marks.includes("code")) text = `<code>${text}</code>`
          }
          return text
        } else if (node.type === "link") {
          const target = node.openInNewTab ? ' target="_blank"' : ""
          return `<a href="${node.url || "#"}"${target}>${this.renderNodesToHtml(node.children || [])}</a>`
        }
        return ""
      })
      .join("")
  }

  private saveProps() {
    const parsedNodes = this.parseDOM(this.editableDiv)

    this.props = {
      ...this.props,
      text: parsedNodes
    }

    this.dispatchEvent(
      new CustomEvent("props-change", {
        detail: { props: this.props },
        bubbles: false
      })
    )
  }

  private parseDOM(root: Node): InlineNode[] {
    const nodes: InlineNode[] = []

    root.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) {
          nodes.push({ type: "text", text: child.textContent })
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const tagName = el.tagName.toLowerCase()

        if (tagName === "a") {
          const a = el as HTMLAnchorElement
          nodes.push({
            type: "link",
            url: a.href,
            children: this.parseDOM(el)
          })
        } else {
          // Flatten formatting
          const childNodes = this.parseDOM(el)

          let mark = ""
          if (["strong", "b"].includes(tagName)) mark = "bold"
          else if (["em", "i"].includes(tagName)) mark = "italic"
          else if (["u"].includes(tagName)) mark = "underline"
          else if (["s", "strike"].includes(tagName)) mark = "strikethrough"
          else if (["code"].includes(tagName)) mark = "code"

          if (mark) {
            childNodes.forEach((n) => {
              if (n.type === "text") {
                n.marks = n.marks || []
                if (!n.marks.includes(mark)) n.marks.push(mark)
              }
            })
          }

          nodes.push(...childNodes)
        }
      }
    })

    return nodes
  }
}

if (!customElements.get("rimelight-paragraph-editor")) {
  customElements.define("rimelight-paragraph-editor", ParagraphEditor)
}
