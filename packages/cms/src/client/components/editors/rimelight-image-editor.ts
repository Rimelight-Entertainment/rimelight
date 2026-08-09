export class ImageEditor extends HTMLElement {
  private props: Record<string, any> = {}
  private srcInput!: HTMLInputElement
  private altInput!: HTMLInputElement
  private captionInput!: HTMLInputElement
  private previewImg!: HTMLImageElement
  private errorPlaceholder!: HTMLDivElement

  connectedCallback() {
    if (this.childElementCount > 0) return

    this.className = "flex flex-col gap-3 p-3"

    this.innerHTML = `
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Image URL (Src)</label>
        <input type="text" data-field="src" class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500" placeholder="https://..." />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Alt Text</label>
        <input type="text" data-field="alt" class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500" placeholder="Describe the image..." />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Caption (Optional)</label>
        <input type="text" data-field="caption" class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500" placeholder="Caption..." />
      </div>
      <img class="mt-2 rounded-md border border-gray-700 max-h-48 object-contain w-full hidden" />
      <div class="mt-2 h-24 bg-gray-800 border border-gray-700 rounded-md flex flex-col items-center justify-center text-gray-500 text-sm hidden">
        <span>Failed to load image</span>
      </div>
    `

    this.srcInput = this.querySelector('[data-field="src"]') as HTMLInputElement
    this.altInput = this.querySelector('[data-field="alt"]') as HTMLInputElement
    this.captionInput = this.querySelector('[data-field="caption"]') as HTMLInputElement
    this.previewImg = this.querySelector("img") as HTMLImageElement
    this.errorPlaceholder = this.querySelector(".h-24") as HTMLDivElement

    const handleBlur = () => this.saveProps()

    this.srcInput.addEventListener("blur", handleBlur)
    this.altInput.addEventListener("blur", handleBlur)
    this.captionInput.addEventListener("blur", handleBlur)

    this.srcInput.addEventListener("input", () => this.updatePreview())

    this.previewImg.addEventListener("error", () => {
      this.previewImg.classList.add("hidden")
      this.errorPlaceholder.classList.remove("hidden")
    })
    this.previewImg.addEventListener("load", () => {
      this.previewImg.classList.remove("hidden")
      this.errorPlaceholder.classList.add("hidden")
    })

    this.renderContent()
  }

  setProps(props: Record<string, any>) {
    this.props = props || {}
    this.renderContent()
  }

  private renderContent() {
    if (!this.srcInput) return

    this.srcInput.value = this.props.src || ""
    this.altInput.value = this.props.alt || ""
    this.captionInput.value = this.props.caption || ""

    this.updatePreview()
  }

  private updatePreview() {
    const src = this.srcInput.value.trim()
    if (src) {
      this.previewImg.src = src
      // visibility handled by load/error events
    } else {
      this.previewImg.classList.add("hidden")
      this.errorPlaceholder.classList.add("hidden")
    }
  }

  private saveProps() {
    this.props = {
      ...this.props,
      src: this.srcInput.value,
      alt: this.altInput.value,
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

if (!customElements.get("rimelight-image-editor")) {
  customElements.define("rimelight-image-editor", ImageEditor)
}
