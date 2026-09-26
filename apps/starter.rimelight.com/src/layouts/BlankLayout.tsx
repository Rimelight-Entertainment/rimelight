import { type Component, type JSX, Show } from "solid-js"
import { Title, Meta } from "@solidjs/meta"
import RLMain from "@rimelight/ui/components/main/RLMain.tsx"

export interface BlankLayoutProps {
  title?: string | undefined
  description?: string | undefined
  noindex?: boolean | undefined
  children?: JSX.Element
}

export const BlankLayout: Component<BlankLayoutProps> = (props) => {
  return (
    <>
      <Show when={props.title}>
        <Title>{props.title}</Title>
      </Show>
      <Show when={props.description}>
        <Meta name="description" content={props.description} />
      </Show>
      <Show when={props.noindex}>
        <Meta name="robots" content="noindex, nofollow" />
      </Show>
      <RLMain>{props.children}</RLMain>
    </>
  )
}

export default BlankLayout
