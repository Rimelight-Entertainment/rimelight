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

export class RimelightScriptEditor extends HTMLElement {
  private titleInput!: HTMLInputElement
  private synopsisTextarea!: HTMLTextAreaElement
  private charsContainer!: HTMLElement
  private charInput!: HTMLInputElement
  private aPlotInput!: HTMLInputElement
  private bPlotInput!: HTMLInputElement
  private cPlotInput!: HTMLInputElement
  private stingerInput!: HTMLInputElement
  private childrenContainer!: HTMLElement
  private sortableInstance?: Sortable

  private currentProps: {
    title: string
    synopsis: string
    characters: string[]
    aPlot: string
    bPlot: string
    cPlot: string
    stinger: string
    children: BaseBlock[]
  } = {
    title: "",
    synopsis: "",
    characters: [],
    aPlot: "",
    bPlot: "",
    cPlot: "",
    stinger: "",
    children: []
  }
  private sectionDepth: number = 0

  private createHeader(text: string) {
    const el = document.createElement("div")
    el.className = "text-xs font-bold text-amber-400 uppercase tracking-widest mb-1"
    el.textContent = text
    return el
  }

  connectedCallback() {
    if (this.children.length > 0) return

    this.className =
      "flex flex-col gap-4 p-3 border-l-4 border-amber-500 bg-amber-950/10 rounded-r-md"

    const createInput = (placeholder: string, key: keyof typeof this.currentProps) => {
      const el = document.createElement("input")
      el.className =
        "bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
      el.placeholder = placeholder
      el.addEventListener("input", () => {
        ;(this.currentProps as any)[key] = el.value
        this.dispatchPropsChange()
      })
      return el
    }

    // Title
    const titleSection = document.createElement("div")
    titleSection.appendChild(this.createHeader("Script Title"))
    this.titleInput = createInput("Script Title", "title")
    titleSection.appendChild(this.titleInput)

    // Synopsis
    const synSection = document.createElement("div")
    synSection.appendChild(this.createHeader("Synopsis"))
    this.synopsisTextarea = document.createElement("textarea")
    this.synopsisTextarea.className =
      "bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 resize-y min-h-[60px]"
    this.synopsisTextarea.placeholder = "Synopsis..."
    this.synopsisTextarea.addEventListener("input", () => {
      this.currentProps.synopsis = this.synopsisTextarea.value
      this.dispatchPropsChange()
    })
    synSection.appendChild(this.synopsisTextarea)

    // Characters
    const charSection = document.createElement("div")
    charSection.appendChild(this.createHeader("Characters"))

    this.charsContainer = document.createElement("div")
    this.charsContainer.className = "flex flex-wrap gap-2 mb-2 min-h-[24px]"

    const charInputWrapper = document.createElement("div")
    charInputWrapper.className = "flex gap-2"
    this.charInput = document.createElement("input")
    this.charInput.className =
      "bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-1.5 text-sm outline-none focus:border-blue-500 flex-1"
    this.charInput.placeholder = "New character name"
    this.charInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault()
        this.addCharacter(this.charInput.value)
      }
    })
    const addCharBtn = document.createElement("button")
    addCharBtn.className =
      "px-3 py-1.5 text-xs font-medium rounded cursor-pointer bg-gray-700 text-gray-200 hover:bg-gray-600"
    addCharBtn.textContent = "Add"
    addCharBtn.addEventListener("click", () => {
      this.addCharacter(this.charInput.value)
    })
    charInputWrapper.appendChild(this.charInput)
    charInputWrapper.appendChild(addCharBtn)

    charSection.appendChild(this.charsContainer)
    charSection.appendChild(charInputWrapper)

    // Plots Grid
    const plotsSection = document.createElement("div")
    plotsSection.appendChild(this.createHeader("Plots"))
    const plotsGrid = document.createElement("div")
    plotsGrid.className = "grid grid-cols-3 gap-3"

    this.aPlotInput = createInput("A-Plot", "aPlot")
    this.bPlotInput = createInput("B-Plot", "bPlot")
    this.cPlotInput = createInput("C-Plot", "cPlot")

    plotsGrid.appendChild(this.aPlotInput)
    plotsGrid.appendChild(this.bPlotInput)
    plotsGrid.appendChild(this.cPlotInput)
    plotsSection.appendChild(plotsGrid)

    // Stinger
    const stingerSection = document.createElement("div")
    stingerSection.appendChild(this.createHeader("Stinger"))
    this.stingerInput = createInput("Stinger (post-credits etc)", "stinger")
    stingerSection.appendChild(this.stingerInput)

    // Children
    const childrenSection = document.createElement("div")
    childrenSection.className = "mt-4"
    childrenSection.appendChild(this.createHeader("Scenes & Content"))

    this.childrenContainer = document.createElement("div")
    this.childrenContainer.className =
      "mt-2 pl-4 border-l-2 border-amber-800/50 flex flex-col gap-2 min-h-[60px]"
    childrenSection.appendChild(this.childrenContainer)

    this.appendChild(titleSection)
    this.appendChild(synSection)
    this.appendChild(charSection)
    this.appendChild(plotsSection)
    this.appendChild(stingerSection)
    this.appendChild(childrenSection)

    this.setupChildrenListeners()
    this.render()
  }

  setProps(props: any, sectionDepth: number = 0): void {
    this.currentProps = { ...this.currentProps, ...props }
    if (!this.currentProps.characters) this.currentProps.characters = []
    if (!this.currentProps.children) this.currentProps.children = []

    this.sectionDepth = sectionDepth

    if (this.children.length === 0) return
    this.render()
  }

  private addCharacter(name: string) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (!this.currentProps.characters.includes(trimmed)) {
      this.currentProps.characters.push(trimmed)
      this.charInput.value = ""
      this.renderCharacters()
      this.dispatchPropsChange()
    }
  }

  private removeCharacter(name: string) {
    this.currentProps.characters = this.currentProps.characters.filter((c) => c !== name)
    this.renderCharacters()
    this.dispatchPropsChange()
  }

  private render() {
    this.titleInput.value = this.currentProps.title || ""
    this.synopsisTextarea.value = this.currentProps.synopsis || ""
    this.aPlotInput.value = this.currentProps.aPlot || ""
    this.bPlotInput.value = this.currentProps.bPlot || ""
    this.cPlotInput.value = this.currentProps.cPlot || ""
    this.stingerInput.value = this.currentProps.stinger || ""

    this.renderCharacters()
    this.renderChildren()
  }

  private renderCharacters() {
    this.charsContainer.innerHTML = ""
    const chars = this.currentProps.characters || []

    if (chars.length === 0) {
      const empty = document.createElement("div")
      empty.className = "text-xs text-gray-500 italic py-1"
      empty.textContent = "No characters added"
      this.charsContainer.appendChild(empty)
      return
    }

    chars.forEach((char) => {
      const chip = document.createElement("div")
      chip.className =
        "inline-flex items-center gap-1 px-2 py-0.5 bg-amber-900/40 text-amber-200 text-xs rounded-full"

      const text = document.createElement("span")
      text.textContent = char

      const remove = document.createElement("span")
      remove.className = "text-amber-400 hover:text-red-400 cursor-pointer ml-1 font-bold"
      remove.innerHTML = "&times;"
      remove.addEventListener("click", () => this.removeCharacter(char))

      chip.appendChild(text)
      chip.appendChild(remove)
      this.charsContainer.appendChild(chip)
    })
  }

  private renderChildren(): void {
    if (!this.childrenContainer) return
    this.childrenContainer.innerHTML = ""

    const childrenBlocks = this.currentProps.children || []

    if (childrenBlocks.length === 0) {
      const empty = document.createElement("div")
      empty.className =
        "cms-empty-placeholder text-gray-600 text-xs italic py-4 text-center border border-dashed border-gray-800/80 rounded my-1 select-none pointer-events-none"
      empty.textContent = "Empty script — drag scenes here"
      this.childrenContainer.appendChild(empty)
    } else {
      childrenBlocks.forEach((block) => {
        const el = document.createElement("rimelight-block") as any
        el.dataset.id = block.id
        this.childrenContainer.appendChild(el)
        if (typeof el.setBlock === "function") {
          el.setBlock(block, this.sectionDepth)
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
    )
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

if (!customElements.get("rimelight-script-editor")) {
  customElements.define("rimelight-script-editor", RimelightScriptEditor)
}
