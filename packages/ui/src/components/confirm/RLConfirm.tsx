import type { RLConfirmProps } from "./confirm.types";
import { RLConfirmTheme } from "./confirm.theme";
import { createMemo, createSignal, omit, type Component } from "solid-js";
import { RLModal } from "../modal/RLModal";
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
    "defaultOpen",
    "size",
    "dismissible",
    "portal",
    "transition",
    "lockScroll",
    "unmountOnHide",
    "ui",
    "class",
    "className",
    "children",
    "trigger",
    "triggerSlot",
    "titleSlot",
    "descriptionSlot",
    "footer",
    "footerSlot",
    "onOpenChange",
    "onUpdateOpen",
    "onConfirm",
    "onCancel",
    "onClose",
  );

  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : uncontrolledOpen());

  const resolvedTheme = createMemo(() =>
    RLConfirmTheme({
      variant: props.variant ?? "default",
      ui: props.ui,
      class: props.class ?? props.className,
    }),
  );

  const setOpenState = (next: boolean) => {
    if (props.open === undefined) {
      setUncontrolledOpen(next);
    }
    props.onOpenChange?.(next);
    props.onUpdateOpen?.(next);
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
        root: resolvedTheme().root,
        trigger: resolvedTheme().trigger,
        content: resolvedTheme().content,
        header: resolvedTheme().header,
        title: resolvedTheme().title,
        description: resolvedTheme().description,
        footer: resolvedTheme().footer,
        ...props.ui,
      }}
      class={props.class ?? props.className}
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
              class={resolvedTheme().cancelButton}
              data-slot="cancel"
              variant="outline"
              color={isDestructive() ? "error" : "neutral"}
              type="button"
              onClick={handleCancel}
            >
              {props.cancelLabel ?? "Cancel"}
            </RLButton>
            <RLButton
              class={resolvedTheme().actionButton}
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
