import { createMemo, omit, type Component } from "solid-js";
import type { RLGalleryProps } from "./gallery.types";
import { galleryTheme } from "./gallery.theme";

export const RLGallery: Component<RLGalleryProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() => galleryTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
