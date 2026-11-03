import type { Component } from "solid-js";
import type { RLGalleryProps } from "./gallery.types";
import { RLGalleryTheme } from "./gallery.theme";

export const RLGallery: Component<RLGalleryProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLGalleryTheme.setup(props);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {children()}
    </Tag>
  );
};
