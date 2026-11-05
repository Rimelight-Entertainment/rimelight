import { Show, type Component } from "solid-js";
import type { RLConfirmProps } from "./confirm.types";
import { RLConfirmTheme } from "./confirm.theme";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";
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

  const cancelText = () => props.cancelLabel ?? uiT("confirm.cancel");
  const actionText = () => props.actionLabel ?? uiT("confirm.confirm");

  const handleCancel = () => {
    setOpen(false);
    props.onCancel?.();
  };

  const handleConfirm = () => {
    setOpen(false);
    props.onConfirm?.();
  };

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setOpen(true);
      return;
    }
    handleCancel();
  };

  const renderActions = () => (
    <div class={classes().actions} data-slot="actions">
      <RLButton
        class={classes().cancelButton}
        data-slot="cancel-button"
        variant="outline"
        color="neutral"
        type="button"
        onClick={handleCancel}
      >
        {cancelText()}
      </RLButton>
      <RLButton
        class={classes().actionButton}
        data-slot="action-button"
        color={props.color}
        variant="solid"
        type="button"
        onClick={handleConfirm}
      >
        {actionText()}
      </RLButton>
    </div>
  );

  // Invoked by Modal only while the dialog is rendered. A custom footer replaces the default
  // action row.
  const renderFooter = () => (
    <Show when={slots.footerSlot()} fallback={renderActions()}>
      {renderSlot(slots.footerSlot())}
    </Show>
  );

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
      onOpenChange={handleOpenChange}
      {...rest}
    >
      {children()}
    </RLModal>
  );
};
