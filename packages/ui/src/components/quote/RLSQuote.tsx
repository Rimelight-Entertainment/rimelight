import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { QuoteProps } from "./quote"
import { quoteTheme } from "./quote.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSQuoteProps extends QuoteProps {
  children?: JSX.Element
  quote?: JSX.Element
  caption?: JSX.Element
}

const RLSQuote: Component<RLSQuoteProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["quote", "caption", "children", "ui", "class"])

  const resolvedClasses = createMemo(() =>
    quoteTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <figure class={resolvedClasses().root} data-slot="root" {...rest}>
      <RLSIcon name="quote" class={resolvedClasses().icon} data-slot="icon" />
      <blockquote class={resolvedClasses().quote} data-slot="quote">
        {props.quote !== undefined ? props.quote : props.children}
      </blockquote>
      {props.caption ? (
        <figcaption class={resolvedClasses().caption} data-slot="caption">
          {props.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export default RLSQuote
