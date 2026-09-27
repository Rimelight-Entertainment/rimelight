import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { StickySurfaceProps } from "./sticky-surface"
import { stickySurfaceTheme } from "./sticky-surface.theme"

export interface RLStickySurfaceProps extends StickySurfaceProps {
  children?: JSX.Element
}

const RLStickySurface: Component<RLStickySurfaceProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "stuckShadow", "offsetTop", "zIndex", "ui", "class", "children")

  const stuckShadow = () => props.stuckShadow ?? true

  const id = `sticky-${Math.random().toString(36).substring(2, 9)}`

  const resolvedClasses = createMemo(() => stickySurfaceTheme({ ui: props.ui, class: props.class }))

  return (
    <div
      class={`${resolvedClasses().root}  ${id}  ${stuckShadow() ? "rl-sticky-shadow" : ""}`}
      data-slot="root"
      {...rest}
    >
      {props.children}
      <style>{`
        .${id} {
          top: ${props.offsetTop ?? 0}px !important;
          z-index: ${props.zIndex ?? 10} !important;
          container-type: scroll-state;
          container-name: rl-sticky-${id};
        }
      `}</style>
      {stuckShadow() ? (
        <style>{`
          @container rl-sticky-${id} scroll-state(stuck: top) {
            .${id} {
              box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.10), 0 1px 4px 0 rgba(0, 0, 0, 0.06);
              border-bottom: 1px solid rgba(0, 0, 0, 0.06);
            }
          }

          @media (prefers-color-scheme: dark) {
            @container rl-sticky-${id} scroll-state(stuck: top) {
              .${id} {
                box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.40), 0 1px 4px 0 rgba(0, 0, 0, 0.20);
                border-bottom: 1px solid rgba(255, 255, 255, 0.06);
              }
            }
          }
        `}</style>
      ) : null}
    </div>
  )
}

export { RLStickySurface }
