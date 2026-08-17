import { onMount, type Component } from "solid-js"

export interface ImageEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const ImageEditor: Component<ImageEditorProps> = (componentProps) => {
  let srcInput: HTMLInputElement | null = null as HTMLInputElement | null
  let altInput: HTMLInputElement | null = null as HTMLInputElement | null
  let captionInput: HTMLInputElement | null = null as HTMLInputElement | null

  const saveProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      src: srcInput?.value || "",
      alt: altInput?.value || "",
      caption: captionInput?.value || ""
    })
  }

  onMount(() => {
    // initial mount
  })

  return (
    <div class="w-full flex flex-col gap-3 p-4 border border-default rounded-xl bg-white dark:bg-neutral-900 shadow-sm">
      <label class="flex flex-col gap-1 cursor-pointer">
        <span class="text-xs font-bold text-muted-foreground uppercase">Image URL</span>
        <input
          id="image-src-input"
          ref={(el) => (srcInput = el)}
          type="text"
          value={componentProps.props.src || ""}
          onBlur={saveProps}
          class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          placeholder="https://..."
        />
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label class="flex flex-col gap-1 cursor-pointer">
          <span class="text-xs font-bold text-muted-foreground uppercase">Alt Text</span>
          <input
            id="image-alt-input"
            ref={(el) => (altInput = el)}
            type="text"
            value={componentProps.props.alt || ""}
            onBlur={saveProps}
            class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="Alt description"
          />
        </label>

        <label class="flex flex-col gap-1 cursor-pointer">
          <span class="text-xs font-bold text-muted-foreground uppercase">Caption</span>
          <input
            id="image-caption-input"
            ref={(el) => (captionInput = el)}
            type="text"
            value={componentProps.props.caption || ""}
            onBlur={saveProps}
            class="w-full bg-white dark:bg-neutral-900 border border-default rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            placeholder="Image caption"
          />
        </label>
      </div>

      {componentProps.props.src && (
        <div class="mt-2 flex justify-center bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg border border-default">
          <img
            src={componentProps.props.src}
            alt={componentProps.props.alt || "Image preview"}
            class="max-h-48 object-cover rounded border border-default shadow-sm"
          />
        </div>
      )}
    </div>
  )
}
