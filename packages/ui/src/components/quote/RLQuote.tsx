import type { Component } from "solid-js";
import type { RLQuoteProps } from "./quote.types";
import { RLQuoteTheme } from "./quote.theme";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["quote", "caption"] as const;

export const RLQuote: Component<RLQuoteProps> = (props) => {
  const { classes, rest, slots } = RLQuoteTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["quoteSlot", "captionSlot"] as const,
  });

  return (
    <figure class={classes().root} data-slot="root" {...rest}>
      <RLIcon name="quote" class={classes().icon} data-slot="icon" />
      <blockquote class={classes().quote} data-slot="quote">
        {slots.quoteSlot() !== undefined ? slots.quoteSlot() : props.children}
      </blockquote>
      {slots.captionSlot() ? (
        <figcaption class={classes().caption} data-slot="caption">
          {slots.captionSlot()}
        </figcaption>
      ) : null}
    </figure>
  );
};
