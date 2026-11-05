import type { Component } from "solid-js";
import type { RLStepsProps } from "./steps.types";
import { RLStepsTheme } from "./steps.theme";

const OMIT_KEYS = ["size"] as const;

export const RLSteps: Component<RLStepsProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLStepsTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-size={props.size ?? "md"}
      {...rest}
    >
      <ol class={classes().list} data-slot="list">
        {children()}
      </ol>
    </Tag>
  );
};
