import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { GalleryProps } from "./gallery"
import { galleryTheme } from "./gallery.theme"

export interface RLGalleryProps extends GalleryProps {
  children?: JSX.Element
}

const RLGallery: Component<RLGalleryProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() => galleryTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLGallery }
export default RLGallery
