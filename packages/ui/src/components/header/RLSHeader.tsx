import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { HeaderProps } from "./header"
import { headerTheme } from "./header.theme"

export interface RLSHeaderProps extends HeaderProps {
  layerType?: "header" | "banner"
  left?: JSX.Element
  center?: JSX.Element
  right?: JSX.Element
  children?: JSX.Element
}

const RLSHeader: Component<RLSHeaderProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "as",
    "layerType",
    "contain",
    "sticky",
    "fixed",
    "stackIndex",
    "hideOnScroll",
    "id",
    "ui",
    "class",
    "left",
    "center",
    "right",
    "children"
  ])

  const tag = () => props.as ?? "header"

  const contain = () => props.contain ?? true
  const sticky = () => props.sticky ?? true
  const fixed = () => props.fixed ?? false
  const stackIndex = () => props.stackIndex ?? 0
  const hideOnScroll = () => props.hideOnScroll ?? false
  const layerType = () => props.layerType ?? "header"
  const isBanner = () => layerType() === "banner"

  const layerId =
    typeof props.id === "string" ? props.id : `rla-header-${Math.random().toString(36).slice(2, 8)}`

  const resolvedClasses = createMemo(() =>
    headerTheme({
      contain: contain(),
      sticky: fixed() ? false : sticky(),
      fixed: fixed(),
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Dynamic
      component={tag()}
      id={layerId}
      data-slot="root"
      class={resolvedClasses().root}
      data-contain={contain() ? "true" : "false"}
      data-rla-header={isBanner() ? undefined : "true"}
      data-rla-banner={isBanner() ? "true" : undefined}
      data-stack-index={stackIndex()}
      data-hide-on-scroll={String(hideOnScroll())}
      data-header-layer-id={layerId}
      data-layer-type={layerType()}
      {...rest}
    >
      <div class={resolvedClasses().content} data-header-content>
        <div class={resolvedClasses().container} data-slot="container">
          <div class={resolvedClasses().left} data-slot="left">
            {props.left}
          </div>
          <div class={resolvedClasses().center} data-slot="center">
            {props.center ?? props.children}
          </div>
          <div class={resolvedClasses().right} data-slot="right">
            {props.right}
          </div>
        </div>
      </div>
    </Dynamic>
  )
}

export default RLSHeader
