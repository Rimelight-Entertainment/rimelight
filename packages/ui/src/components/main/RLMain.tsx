import type { Component } from "solid-js";
import type { RLMainProps } from "./main.types";
import { RLMainTheme } from "./main.theme";

export const RLMain: Component<RLMainProps> = (props) => {
  const { Tag, classes, rest } = RLMainTheme.setup(props, { as: "main" });

  return (
    <Tag id={props["id"] ?? "main-content"} class={classes().root} data-slot="root" {...rest}>
      {props.children}
    </Tag>
  );
};
