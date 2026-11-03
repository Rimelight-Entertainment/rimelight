import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLProgressProps } from "./progress.types";
import { RLProgressTheme } from "./progress.theme";

const OMIT_KEYS = ["value", "max"] as const;

export const RLProgress: Component<RLProgressProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLProgressTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const percentage = createMemo(() =>
    Math.min(100, Math.max(0, ((props.value ?? 0) / (props.max ?? 100)) * 100)),
  );

  const widthClass = createMemo(() => {
    const pct = Math.round(percentage());
    if (pct === 100) return "w-full";
    if (pct === 75) return "w-3/4";
    if (pct === 50) return "w-1/2";
    if (pct === 25) return "w-1/4";
    if (pct === 0) return "w-0";
    return `w-[${pct}%]`;
  });

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={props.max ?? 100}
      aria-valuenow={props.value ?? 0}
      {...rest}
    >
      <div class={`${classes().indicator} ${widthClass()}`} data-slot="indicator" />
      {children()}
    </Tag>
  );
};
