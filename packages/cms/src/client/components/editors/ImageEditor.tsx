import { createSignal, onMount, type Component } from "solid-js"

export interface ImageEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const ImageEditor: Component<ImageEditorProps> = (componentProps) => {
  let srcInput: HTMLInputElement | null = null as HTMLInputElement | null
  let altInput: HTMLInputElement | null = null as HTMLInputElement | null
  let captionInput: HTMLInputElement | null = null as HTMLInputElement | null

  const [imgStatus, setImgStatus] = createSignal<"idle" | "loading" | "loaded" | "error">("idle")
  const [currentSrc, setCurrentSrc] = createSignal("")

  const updatePreview = () => {
    const src = srcInput?.value.trim() || ""
    setCurrentSrc(src)
    if (!src) {
      setImgStatus("idle")
    } else {
      setImgStatus("loading")
    }
  }

  const saveProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      src: srcInput?.value || "",
      alt: altInput?.value || "",
      caption: captionInput?.value || ""
    })
  }

  onMount(() => {
    updatePreview()
  })

  return (
    <div class="rimelight-image-editor flex flex-col gap-3 p-3 w-full">
      <label class="flex flex-col gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Image URL (Src)
        <input
          id="image-src-input"
          ref={(el) => (srcInput = el)}
          type="text"
          data-field="src"
          value={componentProps.props.src || ""}
          onInput={updatePreview}
          onBlur={saveProps}
          class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 font-normal normal-case"
          placeholder="https://..."
        />
      </label>
      <label class="flex flex-col gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Alt Text
        <input
          id="image-alt-input"
          ref={(el) => (altInput = el)}
          type="text"
          data-field="alt"
          value={componentProps.props.alt || ""}
          onBlur={saveProps}
          class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 font-normal normal-case"
          placeholder="Describe the image..."
        />
      </label>
      <label class="flex flex-col gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        Caption (Optional)
        <input
          id="image-caption-input"
          ref={(el) => (captionInput = el)}
          type="text"
          data-field="caption"
          value={componentProps.props.caption || ""}
          onBlur={saveProps}
          class="bg-gray-800 border-gray-700 text-gray-100 rounded px-3 py-2 text-sm w-full outline-none focus:border-blue-500 font-normal normal-case"
          placeholder="Caption text..."
        />
      </label>
      {currentSrc() && (
        <img
          src={currentSrc()}
          alt={altInput?.value || componentProps.props.alt || "Image preview"}
          onLoad={() => setImgStatus("loaded")}
          onError={() => setImgStatus("error")}
          class="preview-img mt-2 rounded-md border border-gray-700 max-h-48 object-contain w-full"
          classList={{ hidden: imgStatus() === "error" || imgStatus() === "idle" }}
        />
      )}
      {imgStatus() === "error" && (
        <div class="error-placeholder mt-2 h-24 bg-gray-800 border border-gray-700 rounded-md flex flex-col items-center justify-center text-gray-500 text-sm">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  )
}
