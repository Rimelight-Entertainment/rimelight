import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { QuoteProps } from "./quote";
import { quoteTheme } from "./quote.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLQuoteProps extends QuoteProps {
  children?: JSX.Element;
  quote?: JSX.Element;
  caption?: JSX.Element;
}

export const RLQuote: Component<RLQuoteProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "quote", "caption", "children", "ui", "class");

  const resolvedClasses = createMemo(() =>
    quoteTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <figure class={resolvedClasses().root} data-slot="root" {...rest}>
      <RLIcon name="quote" class={resolvedClasses().icon} data-slot="icon" />
      <blockquote class={resolvedClasses().quote} data-slot="quote">
        {props.quote !== undefined ? props.quote : props.children}
      </blockquote>
      {props.caption ? (
        <figcaption class={resolvedClasses().caption} data-slot="caption">
          {props.caption}
        </figcaption>
      ) : null}
    </figure>
  );
};
