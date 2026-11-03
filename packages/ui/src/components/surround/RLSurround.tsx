import type { Component } from "solid-js";
import { createMemo, Show } from "solid-js";
import type { RLSurroundProps } from "./surround.types";
import { RLSurroundTheme } from "./surround.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["prev", "next"] as const;

export const RLSurround: Component<RLSurroundProps> = (props) => {
  const { Tag, classes, rest, theme } = RLSurroundTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const prevTheme = createMemo(() =>
    RLSurroundTheme({
      side: "prev",
    }),
  );

  const nextTheme = createMemo(() =>
    RLSurroundTheme({
      side: "next",
    }),
  );

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      hidden={!props.prev && !props.next}
      {...rest}
    >
      <Show when={props.prev} fallback={<div />}>
        {(prev) => (
          <a href={prev().href} class={prevTheme().link}>
            <span class={`${classes().label} ${prevTheme().labelPrev}`}>
              <RLIcon name="arrow-left" class="size-3" /> {uiT("surround.previous")}
            </span>
            <span class={classes().title}>{prev().label}</span>
          </a>
        )}
      </Show>

      <Show when={props.next} fallback={<div />}>
        {(next) => (
          <a href={next().href} class={nextTheme().link}>
            <span class={`${classes().label} ${nextTheme().labelNext}`}>
              {uiT("surround.next")} <RLIcon name="arrow-right" class="size-3" />
            </span>
            <span class={classes().title}>{next().label}</span>
          </a>
        )}
      </Show>
    </Tag>
  );
};
