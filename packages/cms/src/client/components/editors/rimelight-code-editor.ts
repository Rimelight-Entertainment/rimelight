export class CodeEditor extends HTMLElement {
  private props: Record<string, any> = {}
  private languageSelect!: HTMLSelectElement
  private codeTextarea!: HTMLTextAreaElement
  private captionInput!: HTMLInputElement

  connectedCallback() {
    if (this.childElementCount > 0) return

    this.className = "flex flex-col gap-2 p-3"

    const languages = [
      "typescript",
      "javascript",
      "python",
      "bash",
      "html",
      "css",
      "json",
      "markdown",
      "sql",
      "rust",
      "go",
      "c",
      "cpp",
      "other"
    ]

    const options = languages.map((l) => `<option value="${l}">${l}</option>`).join("")

    this.innerHTML = `
      <div class="flex items-center justify-between mb-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Source Code</label>
        <select data-field="language" class="bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded px-2 py-1 outline-none cursor-pointer">
          ${options}
        </select>
      </div>
      <div class="relative">
        <textarea data-field="code" class="w-full bg-gray-950 border border-gray-700 rounded px-3 py-2 text-sm text-green-300 font-mono resize-none outline-none focus:border-blue-500 min-h-[120px] leading-relaxed" placeholder="// Write code here..." spellcheck="false"></textarea>
      </div>
      <input type="text" data-field="caption" class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 mt-2" placeholder="Caption (optional)" />
    `

    this.languageSelect = this.querySelector('[data-field="language"]') as HTMLSelectElement
    this.codeTextarea = this.querySelector('[data-field="code"]') as HTMLTextAreaElement
    this.captionInput = this.querySelector('[data-field="caption"]') as HTMLInputElement

    const autoResize = () => {
      this.codeTextarea.style.height = "auto"
      this.codeTextarea.style.height = this.codeTextarea.scrollHeight + 2 + "px"
    }

    this.codeTextarea.addEventListener("input", autoResize)

    const handleSave = () => this.saveProps()

    this.languageSelect.addEventListener("change", handleSave)
    this.codeTextarea.addEventListener("blur", handleSave)
    this.captionInput.addEventListener("blur", handleSave)

    // Handle tab key
    this.codeTextarea.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault()
        const start = this.codeTextarea.selectionStart
        const end = this.codeTextarea.selectionEnd
        const val = this.codeTextarea.value
        this.codeTextarea.value = val.substring(0, start) + "  " + val.substring(end)
        this.codeTextarea.selectionStart = this.codeTextarea.selectionEnd = start + 2
      }
    })

    this.renderContent()
    setTimeout(autoResize, 0)
  }

  setProps(props: Record<string, any>) {
    this.props = props || {}
    this.renderContent()
  }

  private renderContent() {
    if (!this.codeTextarea) return

    this.languageSelect.value = this.props.language || "typescript"
    this.codeTextarea.value = this.props.code || ""
    this.captionInput.value = this.props.caption || ""

    // Trigger resize
    this.codeTextarea.style.height = "auto"
    this.codeTextarea.style.height = this.codeTextarea.scrollHeight + 2 + "px"
  }

  private saveProps() {
    this.props = {
      ...this.props,
      language: this.languageSelect.value,
      code: this.codeTextarea.value,
      caption: this.captionInput.value
    }
    this.dispatchEvent(
      new CustomEvent("props-change", {
        detail: { props: this.props },
        bubbles: false
      })
    )
  }
}

if (!customElements.get("rimelight-code-editor")) {
  customElements.define("rimelight-code-editor", CodeEditor)
}
