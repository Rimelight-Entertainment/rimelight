import type { RLAspectRatioProps } from "./aspect-ratio.types";
import { RLAspectRatioTheme } from "./aspect-ratio.theme";
import { createMemo, omit, type Component, isStatic } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLAspectRatio: Component<RLAspectRatioProps> = (props) => {
  const rest = omit(props, "as", "ratio", "ui", "class", "children");

  const safeRatio = () => {
    const value = props.ratio ?? 1;
    return Number.isFinite(value) && value > 0 ? value : 1;
  };

  const classes = createMemo(() => RLAspectRatioTheme({ ui: props.ui, class: props.class }));

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

  const Root = dynamic(() => props.as ?? "div", { static: isStatic(props, "as") });

  return (
    <Root class={classes().root} data-slot="root" data-ratio={safeRatio()} {...rest}>
      {inner()}
    </Root>
  );
};
