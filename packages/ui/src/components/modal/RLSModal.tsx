import {
  createMemo,
  splitProps,
  Show,
  onMount,
  onCleanup,
  type Component,
  type JSX
} from "solid-js"
import type { ModalProps } from "./modal"
import { modalTheme } from "./modal.theme"
import RLSIcon from "../icon/RLSIcon"

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

  const handleClose = () => {
    props.onClose?.()
  }

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (props.open && closeOnEscape() && e.key === "Escape") {
        e.preventDefault()
        handleClose()
      }
    }
    document.addEventListener("keydown", handleKeydown)
    onCleanup(() => document.removeEventListener("keydown", handleKeydown))
  })

  const resolvedClasses = createMemo(() =>
    modalTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <Show when={props.open || !props.unmountOnHide}>
      <div
        class={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
          props.open ? "" : "hidden"
        }`}
        data-slot="modal-container"
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close modal backdrop"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-default border-0 p-0 w-full h-full"
          onClick={() => {
            if (closeOnClickOutside()) {
              handleClose()
            }
          }}
        />
        <dialog
          open={props.open}
          class={`relative z-10 w-full rounded-xl border border-default bg-default p-6 shadow-xl outline-none flex flex-col max-h-[90vh] overflow-y-auto m-0 text-foreground ${
            resolvedClasses().content || ""
          }  ${props.class || ""}`}
          data-slot="content"
          {...rest}
        >
          <button
            type="button"
            class="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer border-none bg-transparent"
            data-slot="close-button"
            aria-label="Close modal"
            onClick={handleClose}
          >
            <RLSIcon name="close" size="sm" aria-hidden="true" />
          </button>

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
                resolvedClasses().footer ||
                "flex justify-end gap-2 mt-6 pt-4 border-t border-default"
              }
              data-slot="footer"
            >
              {props.footerSlot}
            </div>
          ) : null}
        </dialog>
      </div>
    </Show>
  )
}

export default RLSModal
