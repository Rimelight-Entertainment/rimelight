import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLProgressProps } from "./progress.types";
import { RLProgressTheme } from "./progress.theme";

const OMIT_KEYS = ["value", "max"] as const;

export const RLProgress: Component<RLProgressProps> = (props) => {
  const { classes, rest } = RLProgressTheme.setup(props, { omit: OMIT_KEYS });

  const value = () => props.value ?? 0;
  const max = () => props.max ?? 100;
  const percentage = createMemo(() => Math.min(100, Math.max(0, (value() / max()) * 100)));

  const widthClass = () => {
    const pct = Math.round(percentage());
    return pct === 100
      ? "w-full"
      : pct === 75
        ? "w-3/4"
        : pct === 50
          ? "w-1/2"
          : pct === 25
            ? "w-1/4"
            : pct === 0
              ? "w-0"
              : `w-[${pct}%]`;
  };

  return (
    <div
      class={classes().root}
      data-slot="progress-root"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max()}
      aria-valuenow={value()}
      data-theme={props.theme}
      {...rest}
    >
      <div class={`${classes().indicator} ${widthClass()}`} data-slot="indicator" />
      {props.children}
    </div>
  );
};
