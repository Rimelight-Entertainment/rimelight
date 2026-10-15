import type { RLQuoteProps } from "./quote.types";
import { RLQuoteTheme } from "./quote.theme";
import { createMemo, omit, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLQuote: Component<RLQuoteProps> = (props) => {
  const rest = omit(props, "quote", "caption", "children", "ui", "class");

  const classes = createMemo(() =>
    RLQuoteTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <figure class={classes().root} data-slot="root" {...rest}>
      <RLIcon name="quote" class={classes().icon} data-slot="icon" />
      <blockquote class={classes().quote} data-slot="quote">
        {props.quote !== undefined ? props.quote : props.children}
      </blockquote>
      {props.caption ? (
        <figcaption class={classes().caption} data-slot="caption">
          {props.caption}
        </figcaption>
      ) : null}
    </figure>
  );
};
