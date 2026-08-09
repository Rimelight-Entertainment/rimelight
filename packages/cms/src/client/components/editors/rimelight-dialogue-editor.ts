export class DialogueEditor extends HTMLElement {
  private props: Record<string, any> = {}
  private characterInput!: HTMLInputElement
  private parentheticalInput!: HTMLInputElement
  private lineTextarea!: HTMLTextAreaElement

  connectedCallback() {
    if (this.childElementCount > 0) return

    this.className =
      "flex flex-col gap-2 p-3 border-l-4 border-purple-500 bg-purple-950/10 rounded-r-md"

    this.innerHTML = `
      <input type="text" data-field="character" class="text-center uppercase font-bold text-sm text-purple-200 bg-transparent border-b border-purple-800 px-2 py-1 outline-none w-48 mx-auto block placeholder-purple-800" placeholder="CHARACTER" />
      <input type="text" data-field="parenthetical" class="text-center italic text-sm text-gray-400 bg-transparent border-b border-gray-700 px-2 py-1 outline-none w-64 mx-auto block placeholder-gray-600" placeholder="(parenthetical)" />
      <textarea data-field="line" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 resize-none outline-none focus:border-purple-500 min-h-[60px]" placeholder="Dialogue line..."></textarea>
    `

    this.characterInput = this.querySelector('[data-field="character"]') as HTMLInputElement
    this.parentheticalInput = this.querySelector('[data-field="parenthetical"]') as HTMLInputElement
    this.lineTextarea = this.querySelector('[data-field="line"]') as HTMLTextAreaElement

    const autoResize = () => {
      this.lineTextarea.style.height = "auto"
      this.lineTextarea.style.height = this.lineTextarea.scrollHeight + "px"
    }

    this.lineTextarea.addEventListener("input", autoResize)

    const handleBlur = () => this.saveProps()

    this.characterInput.addEventListener("blur", handleBlur)
    this.parentheticalInput.addEventListener("blur", handleBlur)
    this.lineTextarea.addEventListener("blur", handleBlur)

    this.renderContent()
    setTimeout(autoResize, 0)
  }

  setProps(props: Record<string, any>) {
    this.props = props || {}
    this.renderContent()
  }

  private renderContent() {
    if (!this.characterInput) return

    this.characterInput.value = this.props.character || ""
    this.parentheticalInput.value = this.props.parenthetical || ""
    this.lineTextarea.value = this.props.line || ""

    // Trigger resize
    this.lineTextarea.style.height = "auto"
    this.lineTextarea.style.height = this.lineTextarea.scrollHeight + "px"
  }

  private saveProps() {
    this.props = {
      ...this.props,
      character: this.characterInput.value,
      parenthetical: this.parentheticalInput.value,
      line: this.lineTextarea.value
    }
    this.dispatchEvent(
      new CustomEvent("props-change", {
        detail: { props: this.props },
        bubbles: false
      })
    )
  }
}

if (!customElements.get("rimelight-dialogue-editor")) {
  customElements.define("rimelight-dialogue-editor", DialogueEditor)
}
