import type { RLSurroundProps } from "./surround.types";
import { RLSurroundTheme } from "./surround.theme";
import { createMemo, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLSurround: Component<RLSurroundProps> = (props) => {
  const classes = createMemo(() =>
    RLSurroundTheme({
      class: props.class,
    }),
  );

  return (
    <Show when={props.prev || props.next}>
      <div class={classes().root}>
        <Show when={props.prev} fallback={<div />}>
          {(prev) => {
            const prevTheme = createMemo(() =>
              RLSurroundTheme({
                side: "prev",
              }),
            );
            return (
              <a href={prev().href} class={prevTheme().link}>
                <span class={`${classes().label} ${prevTheme().labelPrev}`}>
                  <RLIcon name="arrow-left" class="size-3" /> Previous
                </span>
                <span class={classes().title}>{prev().label}</span>
              </a>
            );
          }}
        </Show>

        <Show when={props.next} fallback={<div />}>
          {(next) => {
            const nextTheme = createMemo(() =>
              RLSurroundTheme({
                side: "next",
              }),
            );
            return (
              <a href={next().href} class={nextTheme().link}>
                <span class={`${classes().label} ${nextTheme().labelNext}`}>
                  Next <RLIcon name="arrow-right" class="size-3" />
                </span>
                <span class={classes().title}>{next().label}</span>
              </a>
            );
          }}
        </Show>
      </div>
    </Show>
  );
};
