import { type Component, type JSX, Show } from "solid-js"
import { Title, Meta } from "@solidjs/meta"

export interface OgLayoutProps {
  title?: string
  description?: string
  children?: JSX.Element
}

export const OgLayout: Component<OgLayoutProps> = (props) => {
  return (
    <>
      <Show when={props.title}>
        <Title>{props.title}</Title>
      </Show>
      <Show when={props.description}>
        <Meta name="description" content={props.description} />
      </Show>
      <Meta name="robots" content="noindex" />
      <div class="w-full h-full flex items-center justify-center bg-black text-white">
        {props.children}
      </div>
    </>
  )
}

export default OgLayout
