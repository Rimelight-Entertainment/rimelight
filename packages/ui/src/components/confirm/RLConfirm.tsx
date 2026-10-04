import { createEffect, createMemo, createSignal, omit, type Component } from "solid-js";
import type { RLConfirmProps } from "./confirm";
import { confirmTheme } from "./confirm.theme";
import { RLButton } from "../button/RLButton";

export const RLConfirm: Component<RLConfirmProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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
    "footer",
    "footerSlot",
    "onOpenChange",
    "onConfirm",
    "onCancel",
  );

  const [isOpen, setIsOpen] = createSignal(props.open ?? false);
  let dialogRef: HTMLDialogElement | undefined;

  const resolvedClasses = createMemo(() =>
    confirmTheme({
      variant: props.variant ?? "default",
      ui: props.ui,
      class: props.class,
    }),
  );

  createEffect(
    () => isOpen(),
    (open) => {
      if (!dialogRef) return;
      if (open) {
        if (!dialogRef.open) dialogRef.showModal();
      } else {
        if (dialogRef.open) dialogRef.close();
      }
    },
  );

  createEffect(
    () => props.open,
    (open) => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    },
  );

  const openDialog = () => {
    setIsOpen(true);
    props.onOpenChange?.(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    props.onOpenChange?.(false);
    props.onCancel?.();
  };

  const handleAction = () => {
    setIsOpen(false);
    props.onOpenChange?.(false);
    props.onConfirm?.();
  };

  const isDestructive = () => props.variant === "destructive";

  return (
    <div class={resolvedClasses().root} data-slot="alert-dialog-container">
      {props.triggerLabel ? (
        <RLButton
          class={resolvedClasses().trigger}
          data-slot="trigger"
          type="button"
          onClick={openDialog}
        >
          {props.triggerLabel}
        </RLButton>
      ) : props.trigger ? (
        <span onClick={openDialog}>{props.trigger}</span>
      ) : null}

      <dialog
        ref={(el) => (dialogRef = el)}
        class={resolvedClasses().content}
        data-slot="content"
        aria-modal="true"
        data-lock-scroll="true"
        data-state={isOpen() ? "open" : "closed"}
        onCancel={(e) => {
          e.preventDefault();
          handleCancel();
        }}
        onClick={(e) => {
          if (e.target === dialogRef) handleCancel();
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
          {props.footer !== undefined || props.footerSlot !== undefined ? (
            (props.footer ?? props.footerSlot)
          ) : (
            <>
              <RLButton
                class={resolvedClasses().cancelButton}
                data-slot="cancel"
                variant="outline"
                color={isDestructive() ? "error" : "neutral"}
                type="button"
                onClick={handleCancel}
              >
                {props.cancelLabel ?? "Cancel"}
              </RLButton>
              <RLButton
                class={resolvedClasses().actionButton}
                data-slot="action"
                color={isDestructive() ? "error" : "primary"}
                variant={isDestructive() ? "subtle" : "solid"}
                type="button"
                onClick={handleAction}
              >
                {props.actionLabel ?? "Confirm"}
              </RLButton>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
};
