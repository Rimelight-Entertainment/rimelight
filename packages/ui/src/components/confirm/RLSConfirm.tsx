import {
  createEffect,
  createMemo,
  createSignal,
  splitProps,
  type Component,
  type JSX
} from "solid-js"
import type { ConfirmProps } from "./confirm"
import { confirmTheme } from "./confirm.theme"
import RLSButton from "../button/RLSButton"

export interface RLSConfirmProps extends ConfirmProps {
  children?: JSX.Element
  trigger?: JSX.Element
  titleSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  footerSlot?: JSX.Element
  onOpenChange?: (open: boolean) => void
  onConfirm?: () => void
  onCancel?: () => void
}

const RLSConfirm: Component<RLSConfirmProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "variant",
    "title",
    "description",
    "actionLabel",
    "cancelLabel",
    "triggerLabel",
    "open",
    "ui",
    "class",
    "children",
    "trigger",
    "titleSlot",
    "descriptionSlot",
    "footerSlot",
    "onOpenChange",
    "onConfirm",
    "onCancel"
  ])

  const [isOpen, setIsOpen] = createSignal(props.open ?? false)
  let dialogRef: HTMLDialogElement | undefined

  const resolvedClasses = createMemo(() =>
    confirmTheme({
      variant: props.variant ?? "default",
      ui: props.ui,
      class: props.class
    })
  )

  createEffect(() => {
    if (!dialogRef) return
    if (isOpen()) {
      if (!dialogRef.open) dialogRef.showModal()
    } else {
      if (dialogRef.open) dialogRef.close()
    }
  })

  createEffect(() => {
    if (props.open !== undefined) {
      setIsOpen(props.open)
    }
  })

  const openDialog = () => {
    setIsOpen(true)
    props.onOpenChange?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    props.onOpenChange?.(false)
    props.onCancel?.()
  }

  const handleAction = () => {
    setIsOpen(false)
    props.onOpenChange?.(false)
    props.onConfirm?.()
  }

  const isDestructive = () => props.variant === "destructive"

  return (
    <div class={resolvedClasses().root} data-slot="alert-dialog-container">
      {props.triggerLabel ? (
        <RLSButton
          class={resolvedClasses().trigger}
          data-slot="trigger"
          type="button"
          onClick={openDialog}
        >
          {props.triggerLabel}
        </RLSButton>
      ) : props.trigger ? (
        <span onClick={openDialog}>{props.trigger}</span>
      ) : null}

      <dialog
        ref={(el) => (dialogRef = el)}
        class={resolvedClasses().content}
        data-slot="content"
        data-lock-scroll="true"
        data-state={isOpen() ? "open" : "closed"}
        onCancel={(e) => {
          e.preventDefault()
          handleCancel()
        }}
        onClick={(e) => {
          if (e.target === dialogRef) handleCancel()
        }}
        {...rest}
      >
        <div class={resolvedClasses().header} data-slot="header">
          {props.title ? (
            <h3 class={resolvedClasses().title} data-slot="title">
              {props.title}
            </h3>
          ) : null}
          {props.titleSlot}
          {props.description ? (
            <p class={resolvedClasses().description} data-slot="description">
              {props.description}
            </p>
          ) : null}
          {props.descriptionSlot}
        </div>

        {props.children}

        <div class={resolvedClasses().footer} data-slot="footer">
          {props.footerSlot ? (
            props.footerSlot
          ) : (
            <>
              <RLSButton
                class={resolvedClasses().cancelButton}
                data-slot="cancel"
                variant="outline"
                color={isDestructive() ? "error" : "neutral"}
                type="button"
                onClick={handleCancel}
              >
                {props.cancelLabel ?? "Cancel"}
              </RLSButton>
              <RLSButton
                class={resolvedClasses().actionButton}
                data-slot="action"
                color={isDestructive() ? "error" : "primary"}
                variant={isDestructive() ? "subtle" : "solid"}
                type="button"
                onClick={handleAction}
              >
                {props.actionLabel ?? "Confirm"}
              </RLSButton>
            </>
          )}
        </div>
      </dialog>
    </div>
  )
}

export default RLSConfirm
