import type { RLChipProps } from "./chip.types";
import { RLChipTheme } from "./chip.theme";
import { createMemo, omit, Show, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLChip: Component<RLChipProps> = (props) => {
  const rest = omit(
    props,
    "as",
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
    "contentSlot",
  );

  const isStandalone = () => Boolean(props.standalone);
  const isInset = () => Boolean(props.inset);

  const classes = createMemo(() =>
    RLChipTheme({
      color: props.color ?? "primary",
      size: props.size ?? "md",
      position: props.position ?? "top-right",
      inset: isInset(),
      standalone: isStandalone(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const isVisible = () => props.show ?? true;

  const Root = dynamic(() => props.as ?? "div");

  const renderContent = () => {
    if (props.contentSlot !== undefined && props.contentSlot !== null) {
      return props.contentSlot;
    }
    if (props.content !== undefined && props.content !== null) {
      return props.content;
    }
    if (props.text !== undefined && props.text !== null) {
      return props.text;
    }
    return null;
  };

  return (
    <Root class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.children}
      <Show when={isVisible()}>
        <span class={classes().base} data-slot="base">
          {renderContent()}
        </span>
      </Show>
    </Root>
  );
};
