import type { RLGalleryProps } from "./gallery.types";
import { RLGalleryTheme } from "./gallery.theme";
import { createMemo, omit, type Component } from "solid-js";

export const RLGallery: Component<RLGalleryProps> = (props) => {
  const rest = omit(props, "ui", "class", "children");

  const classes = createMemo(() => RLGalleryTheme({ ui: props.ui, class: props.class }));

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
