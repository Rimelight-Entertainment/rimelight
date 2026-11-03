import type { Component } from "solid-js";
import type { RLQuoteProps } from "./quote.types";
import { RLQuoteTheme } from "./quote.theme";
import { RLIcon } from "../icon/RLIcon";

export const RLQuote: Component<RLQuoteProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLQuoteTheme.setup(props, {
    as: "figure",
    slots: ["quoteSlot", "captionSlot"] as const,
  });

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <RLIcon name="quote" class={classes().icon} data-slot="icon" />
      <blockquote class={classes().quote} data-slot="quote">
        {slots.quoteSlot() ?? children()}
      </blockquote>
      {slots.captionSlot() ? (
        <figcaption class={classes().caption} data-slot="caption">
          {slots.captionSlot()}
        </figcaption>
      ) : null}
    </Tag>
  );
};
