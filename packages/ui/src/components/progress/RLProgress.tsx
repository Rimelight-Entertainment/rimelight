import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ProgressProps } from "./progress";
import { progressTheme } from "./progress.theme";

export interface RLProgressProps extends ProgressProps {
  children?: JSX.Element;
}

const RLProgress: Component<RLProgressProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "value", "max", "theme", "color", "ui", "class", "children");

  const value = () => props.value ?? 0;
  const max = () => props.max ?? 100;
  const percentage = createMemo(() => Math.min(100, Math.max(0, (value() / max()) * 100)));

  const resolvedClasses = createMemo(() =>
    progressTheme({
      color: props.color,
      ui: props.ui,
      class: props.class
    })
  );

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
      class={resolvedClasses().root}
      data-slot="progress-root"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max()}
      aria-valuenow={value()}
      data-theme={props.theme}
      {...rest}
    >
      <div class={`${resolvedClasses().indicator} ${widthClass()}`} data-slot="indicator" />
      {props.children}
    </div>
  );
};

export { RLProgress };
