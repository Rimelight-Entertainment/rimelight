import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type Component,
  type JSX
} from "solid-js"
import type { SlideoverProps } from "./slideover"
import { slideoverTheme } from "./slideover.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSSlideoverProps extends SlideoverProps {
  children?: JSX.Element
  triggerSlot?: JSX.Element
  titleSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  footerSlot?: JSX.Element
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

const RLSSlideover: Component<RLSSlideoverProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "side",
    "open",
    "defaultOpen",
    "title",
    "description",
    "triggerLabel",
    "unmountOnHide",
    "ui",
    "class",
    "children",
    "triggerSlot",
    "titleSlot",
    "descriptionSlot",
    "footerSlot",
    "onOpenChange"
  ])

  const side = () => props.side ?? "left"
  const unmountOnHide = () => props.unmountOnHide ?? true

  const [isOpen, setIsOpen] = createSignal(props.open ?? props.defaultOpen ?? false)

  createEffect(() => {
    if (props.open !== undefined) {
      setIsOpen(props.open)
    }
  })

  const setOpenState = (open: boolean) => {
    if (props.open === undefined) {
      setIsOpen(open)
    }
    props.onOpenChange?.(open)
  }

  onMount(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        setOpenState(false)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    onCleanup(() => window.removeEventListener("keydown", onKeyDown))
  })

  const resolvedClasses = createMemo(() =>
    slideoverTheme({
      side: side(),
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="slideover-container" {...rest}>
      {props.triggerSlot ? (
        <span onClick={() => setOpenState(true)}>{props.triggerSlot}</span>
      ) : props.triggerLabel ? (
        <button
          type="button"
          class={resolvedClasses().trigger}
          data-slot="trigger"
          onClick={() => setOpenState(true)}
        >
          {props.triggerLabel}
        </button>
      ) : null}

      <Show when={!unmountOnHide() || isOpen()}>
        <Show when={isOpen()}>
          <div
            class={resolvedClasses().backdrop}
            data-slot="backdrop"
            onClick={() => setOpenState(false)}
          />
        </Show>

        <div
          class={resolvedClasses().content}
          data-slot="content"
          data-state={isOpen() ? "open" : "closed"}
          style={{ display: isOpen() ? undefined : "none" }}
        >
          <button
            class={resolvedClasses().closeButton}
            data-slot="close-button"
            type="button"
            aria-label="Close slideover"
            onClick={() => setOpenState(false)}
          >
            <RLSIcon name="i-rl-close" class="size-4" aria-hidden="true" />
          </button>

          <div class={resolvedClasses().header} data-slot="header">
            {props.titleSlot !== undefined ? (
              props.titleSlot
            ) : props.title ? (
              <h3 class={resolvedClasses().title} data-slot="title">
                {props.title}
              </h3>
            ) : null}

            {props.descriptionSlot !== undefined ? (
              props.descriptionSlot
            ) : props.description ? (
              <p class={resolvedClasses().description} data-slot="description">
                {props.description}
              </p>
            ) : null}
          </div>

          {props.children}

          {props.footerSlot !== undefined && (
            <div class={resolvedClasses().footer} data-slot="footer">
              {props.footerSlot}
            </div>
          )}
        </div>
      </Show>
    </div>
  )
}

export default RLSSlideover
