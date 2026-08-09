import type Sortable from "sortablejs"
import { initBlockSortable } from "../../utils/sortable"

interface BaseBlock {
  id: string
  type: string
  isTemplated?: boolean
  templatedProps?: boolean | string[]
  allowedRoles?: string[]
  requiredPermission?: string
  props: Record<string, any>
  children?: BaseBlock[]
}

export class RimelightSectionEditor extends HTMLElement {
  private titleInput!: HTMLInputElement
  private descInput!: HTMLInputElement
  private levelBadge!: HTMLElement
  private childrenContainer!: HTMLElement
  private sortableInstance?: Sortable

  private currentProps: {
    title: string
    description?: string
    level?: number
    children: BaseBlock[]
  } = { title: "", children: [] }
  private sectionDepth: number = 0

  connectedCallback() {
    if (this.children.length > 0) return

    this.className = "flex flex-col gap-3 w-full"

    const header = document.createElement("div")
    header.className = "flex items-center gap-2 w-full"

    this.levelBadge = document.createElement("div")
    this.levelBadge.className =
      "text-xs font-mono text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded shrink-0"

    this.titleInput = document.createElement("input")
    this.titleInput.type = "text"
    this.titleInput.placeholder = "Section Title"
    this.titleInput.className =
      "flex-1 w-full min-w-0 bg-transparent border-b border-gray-700 text-gray-100 font-semibold outline-none py-1 focus:border-blue-500 text-lg"
    this.titleInput.addEventListener("input", () => {
      this.currentProps.title = this.titleInput.value
      this.dispatchPropsChange()
    })

    header.appendChild(this.levelBadge)
    header.appendChild(this.titleInput)

    this.descInput = document.createElement("input")
    this.descInput.type = "text"
    this.descInput.placeholder = "Optional description..."
    this.descInput.className =
      "w-full min-w-0 bg-transparent border-b border-gray-700 text-gray-400 text-sm outline-none py-1 focus:border-blue-500"
    this.descInput.addEventListener("input", () => {
      this.currentProps.description = this.descInput.value
      this.dispatchPropsChange()
    })

    const divider = document.createElement("hr")
    divider.className = "border-t border-gray-800 my-1"

    this.childrenContainer = document.createElement("div")
    this.childrenContainer.className =
      "flex flex-col gap-2 min-h-[48px] pl-4 border-l-2 border-gray-700"

    const addButton = document.createElement("button")
    addButton.className =
      "text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 py-2 cursor-pointer bg-transparent border-none w-fit"
    addButton.innerHTML = "<span>+</span> Add block"
    addButton.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("block-picker-request", {
          bubbles: true,
          detail: { targetId: null, position: "after", containerId: this.dataset.blockId }
        })
      )
    })

    this.appendChild(header)
    this.appendChild(this.descInput)
    this.appendChild(divider)
    this.appendChild(this.childrenContainer)
    this.appendChild(addButton)

    this.setupChildrenListeners()
    this.render()
  }

  setProps(
    props: { title: string; description?: string; level?: number; children: BaseBlock[] },
    sectionDepth: number = 0
  ): void {
    this.currentProps = { ...this.currentProps, ...props }
    this.sectionDepth = sectionDepth

    if (this.children.length === 0) {
      // not connected yet
      return
    }
    this.render()
  }

  private render() {
    this.titleInput.value = this.currentProps.title || ""
    this.descInput.value = this.currentProps.description || ""

    const displayLevel = Math.min((this.sectionDepth || 0) + 1, 6)
    this.levelBadge.textContent = `H${displayLevel}`
    if (displayLevel <= 2) this.titleInput.classList.add("text-xl")
    else this.titleInput.classList.remove("text-xl")

    this.renderChildren()
  }

  private renderChildren(): void {
    if (!this.childrenContainer) return
    this.childrenContainer.innerHTML = ""

    const childrenBlocks = this.currentProps.children || []

    if (childrenBlocks.length === 0) {
      const empty = document.createElement("div")
      empty.className =
        "cms-empty-placeholder text-gray-600 text-xs italic py-4 text-center border border-dashed border-gray-800/80 rounded my-1 select-none pointer-events-none"
      empty.textContent = "Empty section — drag blocks here or click + to add"
      this.childrenContainer.appendChild(empty)
    } else {
      childrenBlocks.forEach((block) => {
        const el = document.createElement("rimelight-block") as any
        el.dataset.id = block.id
        this.childrenContainer.appendChild(el)
        if (typeof el.setBlock === "function") {
          el.setBlock(block, (this.sectionDepth || 0) + 1)
        }
      })
    }

    if (this.sortableInstance) this.sortableInstance.destroy()
    this.sortableInstance = initBlockSortable(this.childrenContainer, {
      filter: ".cms-empty-placeholder, .locked",
      onReorder: (oldIdx: number, newIdx: number) => {
        const item = childrenBlocks.splice(oldIdx, 1)[0]
        if (item) childrenBlocks.splice(newIdx, 0, item)
        this.currentProps.children = childrenBlocks
        this.dispatchPropsChange()
      },
      onAdd: () => {
        const placeholder = this.childrenContainer.querySelector(".cms-empty-placeholder")
        if (placeholder) placeholder.remove()
        this.syncChildrenFromDom()
      },
      onRemove: () => {
        this.syncChildrenFromDom()
        if ((this.currentProps.children || []).length === 0) {
          this.renderChildren()
        }
      }
    })
  }

  private syncChildrenFromDom(): void {
    const blockElements = Array.from(
      this.childrenContainer.querySelectorAll(":scope > rimelight-block")
    ) as any[]
    const newChildren: BaseBlock[] = []
    blockElements.forEach((el) => {
      if (el.blockData) {
        newChildren.push(el.blockData)
      }
    })
    this.currentProps.children = newChildren
    this.dispatchPropsChange()
  }

  private setupChildrenListeners(): void {
    this.childrenContainer.addEventListener("block-change", (e: Event) => {
      e.stopPropagation()
      if (e instanceof CustomEvent && e.detail?.block) {
        const block: BaseBlock = e.detail.block
        const childrenBlocks = this.currentProps.children || []
        const idx = childrenBlocks.findIndex((b) => b.id === block.id)
        if (idx !== -1) {
          childrenBlocks[idx] = block
          this.currentProps.children = childrenBlocks
          this.dispatchPropsChange()
        }
      }
    })

    this.childrenContainer.addEventListener("block-delete", (e: Event) => {
      e.stopPropagation()
      if (e instanceof CustomEvent && e.detail?.id) {
        const childrenBlocks = this.currentProps.children || []
        this.currentProps.children = childrenBlocks.filter((b) => b.id !== e.detail.id)
        this.renderChildren()
        this.dispatchPropsChange()
      }
    })

    this.childrenContainer.addEventListener("block-move", (e: Event) => {
      e.stopPropagation()
      if (e instanceof CustomEvent && e.detail) {
        const { id, direction } = e.detail
        const childrenBlocks = this.currentProps.children || []
        const idx = childrenBlocks.findIndex((b) => b.id === id)
        const newIdx = idx + direction
        if (idx !== -1 && newIdx >= 0 && newIdx < childrenBlocks.length) {
          const item = childrenBlocks.splice(idx, 1)[0]!
          childrenBlocks.splice(newIdx, 0, item)
          this.currentProps.children = childrenBlocks
          this.renderChildren()
          this.dispatchPropsChange()
        }
      }
    })

    this.childrenContainer.addEventListener("block-duplicate", (e: Event) => {
      e.stopPropagation()
      if (e instanceof CustomEvent && e.detail?.id) {
        const childrenBlocks = this.currentProps.children || []
        const idx = childrenBlocks.findIndex((b) => b.id === e.detail.id)
        if (idx !== -1) {
          const clone: BaseBlock = JSON.parse(JSON.stringify(childrenBlocks[idx]))
          clone.id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
          childrenBlocks.splice(idx + 1, 0, clone)
          this.currentProps.children = childrenBlocks
          this.renderChildren()
          this.dispatchPropsChange()
        }
      }
    })

    this.childrenContainer.addEventListener("block-add-adjacent", (e: Event) => {
      e.stopPropagation()
      if (e instanceof CustomEvent && e.detail) {
        const { id, position } = e.detail
        this.dispatchEvent(
          new CustomEvent("block-picker-request", {
            bubbles: true,
            detail: { targetId: id, position, containerId: this.dataset.blockId }
          })
        )
      }
    })
  }

  private dispatchPropsChange() {
    this.dispatchEvent(
      new CustomEvent("props-change", {
        bubbles: false,
        detail: { props: { ...this.currentProps } }
      })
    )
  }
}

if (!customElements.get("rimelight-section-editor")) {
  customElements.define("rimelight-section-editor", RimelightSectionEditor)
}
