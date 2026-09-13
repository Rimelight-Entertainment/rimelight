import { type Component, type JSX } from "solid-js"
import RLSIcon from "../icon/RLSIcon"

export interface RLSQuoteProps {
  quote?: JSX.Element
  caption?: JSX.Element
  class?: string
}

const RLSQuote: Component<RLSQuoteProps> = (props) => {
  return (
    <figure class={`relative my-8 border-y-[3px] border-astro-gray-500 py-4 ${props.class ?? ""}`}>
      <RLSIcon name="quote" class="mb-2 s-10 md:absolute md:right-[calc(100%+1rem)] md:top-6" />
      <blockquote class="font-heading heading-3 text-xl font-medium text-white md:text-[32px] md:leading-[40px]">
        {props.quote}
      </blockquote>
      <figcaption class="font-mono mt-4 text-right text-astro-pink-light">
        {props.caption}
      </figcaption>
    </figure>
  )
}

export default RLSQuote
