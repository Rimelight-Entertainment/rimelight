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
  "onOpenChange",
  "onConfirm",
  "onCancel",
  "onClose",
] as const;

const SLOT_KEYS = ["triggerSlot", "titleSlot", "descriptionSlot", "footerSlot"] as const;

export const RLConfirm: Component<RLConfirmProps> = (props) => {
  const { classes, rest, slots } = RLConfirmTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: SLOT_KEYS,
  });

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

  // Invoked by Modal only while the dialog is rendered. A custom footer replaces the default
  // action row.
  const renderFooter = () => {
    const custom = slots.footerSlot();
    if (custom) return custom();
    return (
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
    );
  };

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
      triggerSlot={slots.triggerSlot()}
      triggerLabel={props.triggerLabel}
      titleSlot={slots.titleSlot()}
      descriptionSlot={slots.descriptionSlot()}
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
      footerSlot={renderFooter}
      {...rest}
    >
      {props.children}
    </RLModal>
  );
};
