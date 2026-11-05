import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLProgressProps } from "./progress.types";
import { RLProgressTheme } from "./progress.theme";
import { resolveProgress } from "./progress.helpers";

const OMIT_KEYS = ["value", "max"] as const;

export const RLProgress: Component<RLProgressProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLProgressTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const progress = createMemo(() => resolveProgress(props.value, props.max));

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={progress().max}
      aria-valuenow={progress().value}
      {...rest}
    >
      <div
        class={classes().indicator}
        style={{ "--rl-progress": `${progress().percent}%` }}
        data-slot="indicator"
      />
      {children()}
    </Tag>
  );
};
