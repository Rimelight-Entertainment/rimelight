import { createMemo, createSignal, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { HoverCardProps } from "./hover-card"
import { hoverCardTheme } from "./hover-card.theme"

export interface RLHoverCardProps extends HoverCardProps {
  children?: JSX.Element
  trigger?: JSX.Element
}

const RLHoverCard: Component<RLHoverCardProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "triggerLabel", "placement", "ui", "class", "children", "trigger")

  const [isOpen, setIsOpen] = createSignal(false)

  const resolvedClasses = createMemo(() =>
    hoverCardTheme({
      placement: props.placement ?? "bottom",
      ui: props.ui,
      class: props.class
    })
  )

  const contentClass = () =>
    resolvedClasses()["content"].replace(
      /\s*(invisible|opacity-0|scale-95|pointer-events-none|group-hover\/hover-card:(visible|opacity-100|scale-100|pointer-events-auto))/g,
      ""
    )

  return (
    <div
      class={resolvedClasses().root}
      data-slot="hover-card-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      {...rest}
    >
      <div
        class={resolvedClasses().trigger}
        data-slot="trigger"
        tabindex="0"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {props.trigger ? (
          props.trigger
        ) : props.triggerLabel ? (
          <span class="cursor-help underline decoration-dotted">{props.triggerLabel}</span>
        ) : null}
      </div>

      <div
        class={`${contentClass()} ${
          isOpen()
            ? "visible opacity-100 scale-100 pointer-events-auto"
            : "invisible opacity-0 scale-95 pointer-events-none"
        }`}
        data-slot="content"
      >
        {props.children}
      </div>
    </div>
  )
}

export { RLHoverCard }
