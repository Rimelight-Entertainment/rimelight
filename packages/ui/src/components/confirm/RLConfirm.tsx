import type { RLConfirmProps } from "./confirm.types";
import { RLConfirmTheme } from "./confirm.theme";
import type { Component } from "solid-js";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { RLModal } from "../modal/RLModal";
import { RLButton } from "../button/RLButton";

const OMIT_KEYS = [
  "role",
  "color",
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
] as const;

export const RLConfirm: Component<RLConfirmProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme, ui } = RLConfirmTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot", "titleSlot", "descriptionSlot", "footerSlot"] as const,
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );

  const handleCancel = () => {
    setOpen(false);
    props.onCancel?.();
  };

  const handleConfirm = () => {
    setOpen(false);
    props.onConfirm?.();
  };

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
          color="neutral"
          type="button"
          onClick={handleCancel}
        >
          {props.cancelLabel ?? uiT("confirm.cancel")}
        </RLButton>
        <RLButton
          class={classes().actionButton}
          data-slot="action"
          color={props.color}
          variant="solid"
          type="button"
          onClick={handleConfirm}
        >
          {props.actionLabel ?? uiT("confirm.confirm")}
        </RLButton>
      </div>
    );
  };

  return (
    <RLModal
      as={Tag}
      theme={theme()}
      role="alertdialog"
      open={isOpen()}
      title={props.title}
      description={props.description}
      size={props.size}
      dismissible={props.dismissible}
      portal={props.portal}
      transition={props.transition}
      lockScroll={props.lockScroll}
      unmountOnHide={props.unmountOnHide}
      triggerLabel={props.triggerLabel}
      triggerSlot={slots.triggerSlot()}
      titleSlot={slots.titleSlot()}
      descriptionSlot={slots.descriptionSlot()}
      footerSlot={renderFooter}
      class={classes().root}
      ui={ui()}
      onOpenChange={(next) => (next ? setOpen(true) : handleCancel())}
      {...rest}
    >
      {children()}
    </RLModal>
  );
};
