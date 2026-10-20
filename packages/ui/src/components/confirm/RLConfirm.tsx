import type { RLConfirmProps } from "./confirm.types";
import { RLConfirmTheme } from "./confirm.theme";
import { createSignal, type Component } from "solid-js";
import { RLModal } from "../modal/RLModal";
import { RLButton } from "../button/RLButton";

const OMIT_KEYS = [
  "title",
  "description",
  "actionLabel",
  "cancelLabel",
  "triggerLabel",
  "open",
  "defaultOpen",
  "size",
  "dismissible",
  "portal",
  "transition",
  "lockScroll",
  "unmountOnHide",
  "trigger",
  "triggerSlot",
  "titleSlot",
  "descriptionSlot",
  "footer",
  "footerSlot",
  "onOpenChange",
  "onConfirm",
  "onCancel",
  "onClose",
] as const;

export const RLConfirm: Component<RLConfirmProps> = (props) => {
  const { classes, rest } = RLConfirmTheme.setup(props, { omit: OMIT_KEYS });

  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : uncontrolledOpen());

  const setOpenState = (next: boolean) => {
    if (props.open === undefined) {
      setUncontrolledOpen(next);
    }
    props.onOpenChange?.(next);
    if (!next) {
      props.onClose?.();
    }
  };

  const handleCancel = () => {
    setOpenState(false);
    props.onCancel?.();
  };

  const handleConfirm = () => {
    setOpenState(false);
    props.onConfirm?.();
  };

  const isDestructive = () => props.variant === "destructive";
  const footerContent = () => props.footerSlot ?? props.footer;

  return (
    <RLModal
      role="alertdialog"
      open={isOpen()}
      defaultOpen={props.defaultOpen}
      title={props.title}
      description={props.description}
      size={props.size ?? "sm"}
      dismissible={props.dismissible ?? true}
      portal={props.portal}
      transition={props.transition}
      lockScroll={props.lockScroll}
      unmountOnHide={props.unmountOnHide}
      close={false}
      trigger={props.trigger}
      triggerSlot={props.triggerSlot}
      triggerLabel={props.triggerLabel}
      titleSlot={props.titleSlot}
      descriptionSlot={props.descriptionSlot}
      ui={{
        root: classes().root,
        trigger: classes().trigger,
        content: classes().content,
        header: classes().header,
        title: classes().title,
        description: classes().description,
        footer: classes().footer,
        ...props.ui,
      }}
      class={props.class}
      onOpenChange={(next) => {
        if (!next) {
          handleCancel();
        } else {
          setOpenState(true);
        }
      }}
      onClose={handleCancel}
      footerSlot={() =>
        footerContent() !== undefined ? (
          typeof footerContent() === "function" ? (
            (footerContent() as any)()
          ) : (
            footerContent()
          )
        ) : (
          <div class="flex items-center justify-between w-full" data-slot="confirm-actions">
            <RLButton
              class={classes().cancelButton}
              data-slot="cancel"
              variant="outline"
              color={isDestructive() ? "error" : "neutral"}
              type="button"
              onClick={handleCancel}
            >
              {props.cancelLabel ?? "Cancel"}
            </RLButton>
            <RLButton
              class={classes().actionButton}
              data-slot="action"
              color={isDestructive() ? "error" : "primary"}
              variant="solid"
              type="button"
              onClick={handleConfirm}
            >
              {props.actionLabel ?? "Confirm"}
            </RLButton>
          </div>
        )
      }
      {...rest}
    >
      {props.children}
    </RLModal>
  );
};
