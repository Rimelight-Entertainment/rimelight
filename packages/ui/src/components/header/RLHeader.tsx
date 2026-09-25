import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import { Dynamic } from "solid-js/web"
import type { HeaderProps } from "./header"
import { headerTheme } from "./header.theme"
import { useHeaderStack } from "./useHeaderStack"

export interface RLHeaderProps extends HeaderProps {
  layerType?: "header" | "banner"
  left?: JSX.Element
  center?: JSX.Element
  right?: JSX.Element
  children?: JSX.Element
}

const RLHeader: Component<RLHeaderProps> = (allProps) => {
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
    "style",
    "left",
    "center",
    "right",
    "children"
  ])

  const tag = () => props.as ?? "header"
  const contain = () => props.contain ?? true
  const sticky = () => props.sticky ?? true
  const fixed = () => props.fixed ?? false
  const stackIndex = () => props.stackIndex ?? 1
  const hideOnScroll = () => props.hideOnScroll ?? false
  const layerType = () => props.layerType ?? "header"
  const isBanner = () => layerType() === "banner"

  const layerId =
    typeof props.id === "string" ? props.id : `rl-header-${Math.random().toString(36).slice(2, 8)}`

  const resolvedClasses = createMemo(() =>
    headerTheme({
      contain: contain(),
      sticky: fixed() ? false : sticky(),
      fixed: fixed(),
      ui: props.ui,
      class: props.class
    })
  )

  const { registerHeader } = useHeaderStack()
  const { ref, topOffset, isCollapsed } = registerHeader({
    id: layerId,
    order: stackIndex(),
    type: layerType(),
    sticky: sticky(),
    fixed: fixed(),
    hideOnScroll: hideOnScroll(),
    visible: true
  })

  const dynamicStyles = () => {
    if (!fixed() && !sticky()) return typeof props.style === "object" ? props.style : undefined

    const base: Record<string, any> = {
      top: `${topOffset()}px`,
      transform: isCollapsed() ? "translateY(-100%)" : "translateY(0)",
      transition:
        "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }

    if (typeof props.style === "object" && props.style !== null) {
      return { ...props.style, ...base }
    }
    return base
  }

  return (
    <Dynamic
      ref={ref}
      component={tag()}
      id={layerId}
      data-slot="root"
      class={resolvedClasses().root}
      data-contain={contain() ? "true" : "false"}
      data-rl-header={isBanner() ? undefined : "true"}
      data-rl-banner={isBanner() ? "true" : undefined}
      data-stack-index={stackIndex()}
      data-hide-on-scroll={String(hideOnScroll())}
      data-header-layer-id={layerId}
      data-layer-type={layerType()}
      style={dynamicStyles() as JSX.CSSProperties}
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

export { RLHeader }
export default RLHeader
