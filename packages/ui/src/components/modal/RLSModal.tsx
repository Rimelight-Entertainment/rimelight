import {
  createMemo,
  splitProps,
  Show,
  onMount,
  onCleanup,
  createEffect,
  type Component,
  type JSX
} from "solid-js"
import type { ModalProps } from "./modal"
import { modalTheme } from "./modal.theme"
import RLSButton from "../button/RLSButton"

export interface RLSModalProps extends ModalProps {
  onClose?: () => void
  children?: JSX.Element
  titleSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  footerSlot?: JSX.Element
}

const RLSModal: Component<RLSModalProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "open",
    "onClose",
    "title",
    "description",
    "size",
    "closeOnClickOutside",
    "closeOnEscape",
    "lockScroll",
    "unmountOnHide",
    "ui",
    "class",
    "children",
    "titleSlot",
    "descriptionSlot",
    "footerSlot"
  ])

  const closeOnClickOutside = () => props.closeOnClickOutside !== false
  const closeOnEscape = () => props.closeOnEscape !== false
  const unmountOnHide = () => props.unmountOnHide !== false

  const handleClose = () => {
    props.onClose?.()
  }

  onMount(() => {
    const handleCancel = (e: Event) => {
      // Native Escape fires 'cancel' on the dialog element
      if (e.target !== dialogRef) return
      if (!closeOnEscape()) {
        e.preventDefault()
      } else {
        e.preventDefault()
      }
      handleClose()
    }
    const handleClick = (e: MouseEvent) => {
      // Clicking the ::backdrop means e.target IS the dialog element
      if (closeOnClickOutside() && e.target === dialogRef) {
        handleClose()
      }
    }
    document.addEventListener("cancel", handleCancel)
    document.addEventListener("click", handleClick)
    onCleanup(() => {
      document.removeEventListener("cancel", handleCancel)
      document.removeEventListener("click", handleClick)
    })
  })

  const resolvedClasses = createMemo(() =>
    modalTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  let dialogRef: HTMLDialogElement | undefined

  createEffect(() => {
    if (!dialogRef) return
    if (props.open) {
      if (!dialogRef.open) dialogRef.showModal()
    } else {
      if (dialogRef.open) dialogRef.close()
    }
  })

  return (
    <Show when={props.open || !unmountOnHide()}>
      <dialog
        ref={(el) => (dialogRef = el)}
        class={`w-[calc(100%-1.5rem)] sm:w-full rounded-xl border border-default bg-default p-5 sm:p-6 shadow-xl outline-none flex flex-col max-h-[calc(100dvh-1.5rem)] sm:max-h-[90vh] overflow-y-auto text-highlighted backdrop:bg-black/60 backdrop:backdrop-blur-sm ${
          props.open ? "" : "hidden"
        } ${resolvedClasses().content || ""}  ${props.class || ""}`}
        data-state={props.open ? "open" : "closed"}
        data-slot="content"
        {...rest}
      >
        <RLSButton
          type="button"
          variant="ghost"
          color="neutral"
          size="sm"
          square
          leadingIcon="close"
          aria-label="Close modal"
          data-slot="close-button"
          class="absolute right-4 top-4 text-muted hover:text-highlighted"
          onClick={handleClose}
        />

        {props.title || props.description || props.titleSlot || props.descriptionSlot ? (
          <div class={resolvedClasses().header || "mb-4"} data-slot="header">
            {props.titleSlot ? (
              props.titleSlot
            ) : props.title ? (
              <h3
                class={resolvedClasses().title || "text-lg font-semibold text-highlighted"}
                data-slot="title"
              >
                {props.title}
              </h3>
            ) : null}

            {props.descriptionSlot ? (
              props.descriptionSlot
            ) : props.description ? (
              <p
                class={resolvedClasses().description || "text-sm text-muted"}
                data-slot="description"
              >
                {props.description}
              </p>
            ) : null}
          </div>
        ) : null}

        {props.children}

        {props.footerSlot ? (
          <div
            class={
              resolvedClasses().footer || "flex justify-end gap-2 mt-6 pt-4 border-t border-default"
            }
            data-slot="footer"
          >
            {props.footerSlot}
          </div>
        ) : null}
      </dialog>
    </Show>
  )
}

export default RLSModal
