import type { Component } from "solid-js";
import type { RLQuoteProps } from "./quote.types";
import { RLQuoteTheme } from "./quote.theme";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["quote", "caption"] as const;

export const RLQuote: Component<RLQuoteProps> = (props) => {
  const { classes, rest } = RLQuoteTheme.setup(props, { omit: OMIT_KEYS });

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
