import type { Component } from "solid-js";
import type { RLGalleryProps } from "./gallery.types";
import { RLGalleryTheme } from "./gallery.theme";

export const RLGallery: Component<RLGalleryProps> = (props) => {
  const { classes, rest } = RLGalleryTheme.setup(props);

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};
