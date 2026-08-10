import type { BaseBlock } from "../../core/types/blocks"

export class RimelightBlockNode extends HTMLElement {
  private blockData!: BaseBlock
  private sectionDepth: number = 0
  private editorElement: HTMLElement | null = null
  private contextMenuEl: HTMLElement | null = null
  private outsideClickHandler: ((e: MouseEvent) => void) | null = null

  connectedCallback() {
    this.classList.add("block", "w-full")
  }

  disconnectedCallback() {
    this.closeContextMenu()
  }

  setBlock(block: BaseBlock, sectionDepth: number = 0) {
    this.blockData = block
    this.sectionDepth = sectionDepth
    this.render()
  }

  getBlockData(): BaseBlock {
    return JSON.parse(JSON.stringify(this.blockData))
  }

  private isLocked(): boolean {
    return !!this.blockData.isTemplated || this.blockData.templatedProps === true
  }

  private render() {
    if (!this.blockData) return

    const locked = this.isLocked()

    this.classList.add("block", "w-full")
    this.className = "cms-block-wrap group/block relative w-full block my-2"

    let lockBadge = ""
    if (locked) {
      lockBadge = `<div class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs mb-2 select-none">
        🔒 Locked
      </div>`
    }

    this.innerHTML = `
      <!-- Grip handle - drag & options -->
      <div class="cms-block-grip absolute left-2 top-3 z-20 flex items-center gap-1 opacity-70 hover:opacity-100 group-hover/block:opacity-100 transition-opacity">
        <button class="cms-grip-btn cms-drag-handle p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-gray-200 cursor-grab active:cursor-grabbing flex items-center justify-center text-sm select-none" title="Drag to reorder / Click for options">
          ⠿
        </button>
      </div>
      <!-- The type-specific editor -->
      <div class="cms-block-node flex-1 min-w-0 pl-10 pr-4 py-2 bg-gray-900/60 border border-gray-800 rounded-lg relative">
        ${lockBadge}
        <div class="cms-editor-container"></div>
      </div>
    `

    const gripBtn = this.querySelector(".cms-grip-btn") as HTMLButtonElement
    if (gripBtn) {
      gripBtn.addEventListener("click", (e) => {
        e.stopPropagation()
        this.toggleContextMenu()
      })
    }

    // Create and append the editor element
    const container = this.querySelector(".cms-editor-container") as HTMLDivElement
    if (container) {
      this.editorElement = this.createEditorElement(this.blockData.type)
      container.appendChild(this.editorElement)

      // Allow microtask for element upgrade
      queueMicrotask(() => {
        if (this.editorElement && typeof (this.editorElement as any).setProps === "function") {
          ;(this.editorElement as any).setProps(this.blockData.props, this.sectionDepth)
        }
      })

      // Forward props-change
      this.editorElement.addEventListener("props-change", (e: Event) => {
        if (e instanceof CustomEvent && e.detail?.props) {
          this.blockData.props = { ...this.blockData.props, ...e.detail.props }
          this.dispatchEvent(
            new CustomEvent("block-change", {
              detail: { block: this.blockData },
              bubbles: true
            })
          )
        }
      })
    }
  }

  private createEditorElement(type: string): HTMLElement {
    let tagName = "rimelight-paragraph-editor"
    switch (type) {
      case "ParagraphBlock":
        tagName = "rimelight-paragraph-editor"
        break
      case "SectionBlock":
        tagName = "rimelight-section-editor"
        break
      case "CalloutBlock":
        tagName = "rimelight-callout-editor"
        break
      case "ImageBlock":
        tagName = "rimelight-image-editor"
        break
      case "ScriptBlock":
        tagName = "rimelight-script-editor"
        break
      case "SceneBlock":
        tagName = "rimelight-scene-editor"
        break
      case "DialogueBlock":
        tagName = "rimelight-dialogue-editor"
        break
      case "CodeBlock":
        tagName = "rimelight-code-editor"
        break
      default:
        tagName = "rimelight-paragraph-editor"
        break
    }
    return document.createElement(tagName)
  }

  private toggleContextMenu() {
    if (this.contextMenuEl) {
      this.closeContextMenu()
      return
    }
    this.openContextMenu()
  }

  private openContextMenu() {
    const locked = this.isLocked()

    this.contextMenuEl = document.createElement("div")
    this.contextMenuEl.className =
      "absolute left-0 top-8 z-50 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1"

    if (locked) {
      this.contextMenuEl.innerHTML = `
        <div class="px-3 py-2 text-xs text-gray-400 italic">Locked — cannot delete or move</div>
      `
    } else {
      this.contextMenuEl.innerHTML = `
        <div class="menu-item-move-up flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors">Move Up ↑</div>
        <div class="menu-item-move-down flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors">Move Down ↓</div>
        <div class="my-1 border-t border-gray-800"></div>
        <div class="menu-item-add-above flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors">Add Block Above</div>
        <div class="menu-item-add-below flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors">Add Block Below</div>
        <div class="my-1 border-t border-gray-800"></div>
        <div class="menu-item-duplicate flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-gray-300 transition-colors">Duplicate Block</div>
        <div class="menu-item-delete flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-800 cursor-pointer text-red-400 hover:text-red-300 transition-colors">Delete Block</div>
      `

      const getEl = (cls: string) => this.contextMenuEl!.querySelector(cls) as HTMLElement

      getEl(".menu-item-move-up")?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-move", {
            detail: { id: this.blockData.id, direction: -1 },
            bubbles: true
          })
        )
        this.closeContextMenu()
      })
      getEl(".menu-item-move-down")?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-move", {
            detail: { id: this.blockData.id, direction: 1 },
            bubbles: true
          })
        )
        this.closeContextMenu()
      })
      getEl(".menu-item-add-above")?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-add-adjacent", {
            detail: { id: this.blockData.id, position: "before" },
            bubbles: true
          })
        )
        this.closeContextMenu()
      })
      getEl(".menu-item-add-below")?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-add-adjacent", {
            detail: { id: this.blockData.id, position: "after" },
            bubbles: true
          })
        )
        this.closeContextMenu()
      })
      getEl(".menu-item-duplicate")?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-duplicate", { detail: { id: this.blockData.id }, bubbles: true })
        )
        this.closeContextMenu()
      })
      getEl(".menu-item-delete")?.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("block-delete", { detail: { id: this.blockData.id }, bubbles: true })
        )
        this.closeContextMenu()
      })
    }

    const grip = this.querySelector(".cms-block-grip")
    if (grip) {
      grip.appendChild(this.contextMenuEl)
    }

    // Handle outside clicks
    this.outsideClickHandler = (e: MouseEvent) => {
      if (!this.contains(e.target as Node)) {
        this.closeContextMenu()
      }
    }
    // Add on capture phase to a slightly delayed microtask so the current click doesn't close it instantly
    setTimeout(() => {
      if (this.outsideClickHandler) {
        document.addEventListener("click", this.outsideClickHandler)
      }
    }, 0)
  }

  private closeContextMenu() {
    if (this.contextMenuEl) {
      this.contextMenuEl.remove()
      this.contextMenuEl = null
    }
    if (this.outsideClickHandler) {
      document.removeEventListener("click", this.outsideClickHandler)
      this.outsideClickHandler = null
    }
  }
}

if (!customElements.get("rimelight-block")) {
  customElements.define("rimelight-block", RimelightBlockNode)
}

export { RimelightBlockNode as RimelightBlock }
