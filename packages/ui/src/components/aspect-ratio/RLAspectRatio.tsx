import type { Component } from "solid-js";
import type { RLAspectRatioProps } from "./aspect-ratio.types";
import { RLAspectRatioTheme } from "./aspect-ratio.theme";

const OMIT_KEYS = ["ratio"] as const;

export const RLAspectRatio: Component<RLAspectRatioProps> = (props) => {
  const { Tag: Root, classes, rest } = RLAspectRatioTheme.setup(props, { omit: OMIT_KEYS });

  const safeRatio = () => {
    const value = props.ratio ?? 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
  };

  const spacerHeight = () => (1 / safeRatio()) * 100;

  const inner = () => (
    <>
      <svg
        viewBox={`0 0 100 ${spacerHeight()}`}
        class={classes().spacer}
        data-slot="spacer"
        aria-hidden="true"
      />
      <div class={classes().content} data-slot="content">
        {props.children}
      </div>
    </>
  );

  return (
    <Root class={classes().root} data-slot="root" data-ratio={safeRatio()} {...rest}>
      {inner()}
    </Root>
  );
};
