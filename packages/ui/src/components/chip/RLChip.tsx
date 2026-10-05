import type { RLChipProps } from "./chip.types";
import { RLChipTheme } from "./chip.theme";
import { createMemo, omit, Show, type Component } from "solid-js";

export const RLChip: Component<RLChipProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "text",
    "standalone",
    "show",
    "theme",
    "color",
    "size",
    "position",
    "inset",
    "ui",
    "class",
    "children",
    "content",
  );

  const classes = createMemo(() =>
    RLChipTheme({
      color: props.color,
      size: props.size,
      position: props.position,
      inset: props.inset,
      standalone: props.standalone ?? false,
      ui: props.ui,
      class: props.class,
    }),
  );

  const isVisible = () => props.show ?? true;

  if (props.standalone) {
    return (
      <Show when={isVisible()}>
        <span class={classes().base} data-slot="base">
          {props.children !== undefined ? props.children : props.text}
        </span>
      </Show>
    );
  }

  const baseColorClass = () => (props.color ? `rl-color-${props.color}` : "");

  return (
    <div class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
      <Show when={isVisible()}>
        <span class={`${classes().base} ${baseColorClass()}`} data-slot="base">
          {props.content !== undefined ? props.content : props.text}
        </span>
      </Show>
    </div>
  );
};
