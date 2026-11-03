import type { Component } from "solid-js";
import type { RLFormProps } from "./form.types";
import { RLFormTheme } from "./form.theme";

export const RLForm: Component<RLFormProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLFormTheme.setup(props, {
    as: "form",
    omit: ["onSubmit"] as const,
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      onSubmit={props.onSubmit}
      {...rest}
    >
      {children()}
    </Tag>
  );
};
