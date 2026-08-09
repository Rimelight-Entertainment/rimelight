const BLOCK_DEFS = [
  {
    group: "Text",
    type: "ParagraphBlock",
    label: "Paragraph",
    desc: "Rich text paragraph",
    icon: "¶"
  },
  {
    group: "Text",
    type: "SectionBlock",
    label: "Section",
    desc: "Collapsible section with heading",
    icon: "§"
  },
  {
    group: "Media",
    type: "ImageBlock",
    label: "Image",
    desc: "Embed an image with caption",
    icon: "🖼"
  },
  {
    group: "Media",
    type: "CodeBlock",
    label: "Code",
    desc: "Code block with syntax highlighting",
    icon: "</>"
  },
  {
    group: "Callout",
    type: "CalloutBlock",
    label: "Callout",
    desc: "Highlighted info/warning/note box",
    icon: "⚡"
  },
  {
    group: "Screenplay",
    type: "ScriptBlock",
    label: "Script",
    desc: "Script container with plot tracking",
    icon: "📄"
  },
  {
    group: "Screenplay",
    type: "SceneBlock",
    label: "Scene",
    desc: "Scene with location and time-of-day",
    icon: "🎬"
  },
  {
    group: "Screenplay",
    type: "DialogueBlock",
    label: "Dialogue",
    desc: "Character dialogue line",
    icon: "💬"
  }
]

export class RimelightBlockPicker extends HTMLElement {
  private overlay!: HTMLElement
  private panel!: HTMLElement
  private searchInput!: HTMLInputElement
  private listContainer!: HTMLElement

  private targetId: string | null = null
  private position: "before" | "after" = "after"
  private selectedIndex: number = 0
  private filteredBlocks: typeof BLOCK_DEFS = []

  static get observedAttributes() {
    return ["section-depth"]
  }

  get sectionDepth(): number {
    return parseInt(this.getAttribute("section-depth") || "0", 10)
  }

  connectedCallback() {
    if (this.children.length > 0) return

    this.className = "hidden"

    this.overlay = document.createElement("div")
    this.overlay.className =
      "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    this.overlay.addEventListener("click", (e) => {
      if (e.target === this.overlay) this.close()
    })

    this.panel = document.createElement("div")
    this.panel.className =
      "bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden"
    this.panel.addEventListener("click", (e) => e.stopPropagation())

    const header = document.createElement("div")
    header.className = "flex items-center justify-between px-4 py-3 border-b border-gray-800"

    const title = document.createElement("div")
    title.className = "text-sm font-semibold text-gray-100"
    title.textContent = "Add Block"

    header.appendChild(title)

    this.searchInput = document.createElement("input")
    this.searchInput.className =
      "w-[calc(100%-2rem)] bg-gray-800 border border-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 mx-4 my-3"
    this.searchInput.placeholder = "Search blocks..."
    this.searchInput.addEventListener("input", () => {
      this.filterBlocks()
    })
    this.searchInput.addEventListener("keydown", (e) => this.handleKeydown(e))

    this.listContainer = document.createElement("div")
    this.listContainer.className = "overflow-y-auto max-h-[50vh] pb-2"

    this.panel.appendChild(header)
    this.panel.appendChild(this.searchInput)
    this.panel.appendChild(this.listContainer)
    this.overlay.appendChild(this.panel)
    this.appendChild(this.overlay)

    document.addEventListener("keydown", this.handleGlobalKeydown)
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleGlobalKeydown)
  }

  private handleGlobalKeydown = (e: KeyboardEvent) => {
    if (!this.classList.contains("hidden") && e.key === "Escape") {
      this.close()
    }
  }

  private handleKeydown(e: KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredBlocks.length - 1)
      this.renderList()
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0)
      this.renderList()
    } else if (e.key === "Enter") {
      e.preventDefault()
      const selected = this.filteredBlocks[this.selectedIndex]
      if (selected) {
        this.selectBlock(selected.type)
      }
    }
  }

  open(targetId: string | null, position: "before" | "after") {
    this.targetId = targetId
    this.position = position
    this.classList.remove("hidden")
    this.searchInput.value = ""
    this.filterBlocks()
    setTimeout(() => this.searchInput.focus(), 10)
  }

  close() {
    this.classList.add("hidden")
  }

  private filterBlocks() {
    const query = this.searchInput.value.toLowerCase()

    this.filteredBlocks = BLOCK_DEFS.filter((b) => {
      if (b.type === "SectionBlock" && this.sectionDepth >= 6) return false

      return (
        b.label.toLowerCase().includes(query) ||
        b.type.toLowerCase().includes(query) ||
        b.desc.toLowerCase().includes(query) ||
        b.group.toLowerCase().includes(query)
      )
    })

    this.selectedIndex = 0
    this.renderList()
  }

  private renderList() {
    this.listContainer.innerHTML = ""

    let currentGroup = ""

    if (this.filteredBlocks.length === 0) {
      const empty = document.createElement("div")
      empty.className = "text-center py-4 text-gray-500 text-sm"
      empty.textContent = "No blocks found"
      this.listContainer.appendChild(empty)
      return
    }

    this.filteredBlocks.forEach((block, index) => {
      if (block.group !== currentGroup) {
        currentGroup = block.group
        const header = document.createElement("div")
        header.className =
          "text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-1 mt-2"
        header.textContent = currentGroup
        this.listContainer.appendChild(header)
      }

      const item = document.createElement("div")
      item.className =
        "cms-picker-item flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-gray-800"
      if (index === this.selectedIndex) {
        item.classList.add("bg-gray-800")
        item.scrollIntoView({ block: "nearest" })
      }

      item.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.selectBlock(block.type)
      })

      item.addEventListener("mouseenter", () => {
        this.selectedIndex = index
        this.listContainer.querySelectorAll(".cms-picker-item").forEach((el, i) => {
          if (i === index) {
            el.classList.add("bg-gray-800")
          } else {
            el.classList.remove("bg-gray-800")
          }
        })
      })

      const icon = document.createElement("div")
      icon.className =
        "text-xl w-8 h-8 flex items-center justify-center shrink-0 bg-gray-800 rounded text-gray-300"
      icon.textContent = block.icon

      const content = document.createElement("div")
      content.className = "flex flex-col flex-1"

      const topRow = document.createElement("div")
      topRow.className = "flex items-center justify-between"

      const label = document.createElement("span")
      label.className = "text-sm font-medium text-gray-200"
      label.textContent = block.label

      const typeBadge = document.createElement("span")
      typeBadge.className = "text-[10px] font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded"
      typeBadge.textContent = block.type

      const desc = document.createElement("span")
      desc.className = "text-xs text-gray-500 mt-0.5"
      desc.textContent = block.desc

      topRow.appendChild(label)
      topRow.appendChild(typeBadge)
      content.appendChild(topRow)
      content.appendChild(desc)

      item.appendChild(icon)
      item.appendChild(content)

      this.listContainer.appendChild(item)
    })
  }

  private selectBlock(type: string) {
    this.dispatchEvent(
      new CustomEvent("block-type-selected", {
        bubbles: true,
        composed: true,
        detail: { type, targetId: this.targetId, position: this.position }
      })
    )
    this.close()
  }
}

if (!customElements.get("rimelight-block-picker")) {
  customElements.define("rimelight-block-picker", RimelightBlockPicker)
}
