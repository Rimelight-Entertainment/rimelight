import type { Component } from "solid-js";
import { Show, createMemo } from "solid-js";
import type { RLPageProps } from "./page.types";
import { RLPageTheme } from "./page.theme";

const OMIT_KEYS = ["left", "right"] as const;

export const RLPage: Component<RLPageProps> = (props) => {
  const left = createMemo(() => props.left);
  const right = createMemo(() => props.right);

  const {
    Tag: Root,
    classes,
    rest,
  } = RLPageTheme.setup(props, {
    as: "div",
    omit: OMIT_KEYS,
    variants: () => ({
      left: Boolean(left()),
      right: Boolean(right()),
    }),
  });

  return (
    <Root class={classes().root} data-slot="root" {...rest}>
      <Show when={left()}>
        <div class={classes().left} data-slot="left">
          {left()}
        </div>
      </Show>

      <div class={classes().center} data-slot="center">
        {props.children}
      </div>

      <Show when={right()}>
        <div class={classes().right} data-slot="right">
          {right()}
        </div>
      </Show>
    </Root>
  );
};
