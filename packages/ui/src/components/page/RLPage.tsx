import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { PageProps } from "./page"
import { pageTheme } from "./page.theme"

export interface RLPageProps extends PageProps {
  children?: JSX.Element
}

const RLPage: Component<RLPageProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children")

  const resolvedClasses = createMemo(() => pageTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLPage }
