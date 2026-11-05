import type { Component } from "solid-js";
import { createMemo, Show } from "solid-js";
import type { RLSurroundProps } from "./surround.types";
import { RLSurroundTheme } from "./surround.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLLink } from "../link/RLLink";
import { uiT } from "../../locale";

const OMIT_KEYS = ["prev", "next"] as const;

export const RLSurround: Component<RLSurroundProps> = (props) => {
  const { Tag, classes, rest, theme } = RLSurroundTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const prevClasses = createMemo(() => RLSurroundTheme({ side: "prev" }));
  const nextClasses = createMemo(() => RLSurroundTheme({ side: "next" }));
  const isEmpty = createMemo(() => !props.prev && !props.next);

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} hidden={isEmpty()} {...rest}>
      <Show when={props.prev} fallback={<div />}>
        {(prev) => (
          <RLLink href={prev().href} class={prevClasses().link}>
            <span class={prevClasses().label}>
              <RLIcon name="arrow-left" class={classes().icon} /> {uiT("surround.previous")}
            </span>
            <span class={classes().title}>{prev().label}</span>
          </RLLink>
        )}
      </Show>

      <Show when={props.next} fallback={<div />}>
        {(next) => (
          <RLLink href={next().href} class={nextClasses().link}>
            <span class={nextClasses().label}>
              {uiT("surround.next")} <RLIcon name="arrow-right" class={classes().icon} />
            </span>
            <span class={classes().title}>{next().label}</span>
          </RLLink>
        )}
      </Show>
    </Tag>
  );
};
