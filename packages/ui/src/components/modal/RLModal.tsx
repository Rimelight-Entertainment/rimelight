import {
  children,
  createMemo,
  createSignal,
  createEffect,
  omit,
  Show,
  onSettled,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { ModalProps } from "./modal";
import { modalTheme } from "./modal.theme";
import { RLButton } from "../button/RLButton";

export interface RLModalProps extends ModalProps {
  onClose?: () => void;
  children?: JSX.Element;
  trigger?: JSX.Element;
  triggerSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
}

export const RLModal: Component<RLModalProps> = (allProps) => {
  const props = allProps;
  const resolvedChildren = children(() => props.children);
  const resolvedTrigger = children(() => props.trigger);
  const resolvedTriggerSlot = children(() => props.triggerSlot);
  const resolvedTitleSlot = children(() => props.titleSlot);
  const resolvedDescriptionSlot = children(() => props.descriptionSlot);
  const resolvedFooter = children(() => props.footer);
  const resolvedFooterSlot = children(() => props.footerSlot);
  const rest = omit(
    allProps,
    "open",
    "onClose",
    "title",
    "description",
    "triggerLabel",
    "size",
    "closeOnClickOutside",
    "closeOnEscape",
    "lockScroll",
    "unmountOnHide",
    "ui",
    "class",
    "children",
    "trigger",
    "triggerSlot",
    "titleSlot",
    "descriptionSlot",
    "footer",
    "footerSlot",
  );

  const [internalOpen, setInternalOpen] = createSignal(props.open ?? false);
  const isControlled = () => props.open !== undefined;
  const isOpen = () => (isControlled() ? !!props.open : internalOpen());

  createEffect(
    () => props.open,
    (open) => {
      if (open !== undefined) {
        setInternalOpen(open);
      }
    },
  );

  const closeOnClickOutside = () => props.closeOnClickOutside !== false;
  const closeOnEscape = () => props.closeOnEscape !== false;
  const unmountOnHide = () => props.unmountOnHide !== false;

  const handleClose = () => {
    if (!isControlled()) setInternalOpen(false);
    props.onClose?.();
  };

  const handleOpen = () => {
    if (!isControlled()) setInternalOpen(true);
  };

  let dialogRef: HTMLDialogElement | undefined;

  onSettled(() => {
    const handleCancel = (e: Event) => {
      if (e.target !== dialogRef) return;
      if (!closeOnEscape()) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      handleClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (closeOnClickOutside() && e.target === dialogRef) {
        handleClose();
      }
    };
    document.addEventListener("cancel", handleCancel);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("cancel", handleCancel);
      document.removeEventListener("click", handleClick);
    };
  });

  const resolvedClasses = createMemo(() =>
    modalTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class,
    }),
  );

  createEffect(
    () => isOpen(),
    (open) => {
      if (!dialogRef) return;
      if (open) {
        if (!dialogRef.open && typeof dialogRef.showModal === "function") {
          dialogRef.showModal();
          if (props.lockScroll !== false) {
            document.body.style.overflow = "hidden";
          }
        }
      } else {
        if (dialogRef.open && typeof dialogRef.close === "function") {
          dialogRef.close();
          if (props.lockScroll !== false) {
            document.body.style.overflow = "";
          }
        }
      }
    },
  );

  const triggerContent = () => resolvedTrigger() || resolvedTriggerSlot();
  const footerContent = () => resolvedFooter() || resolvedFooterSlot();

  return (
    <div class={resolvedClasses().root} data-slot="root">
      {triggerContent() ? (
        <span onClick={handleOpen}>{triggerContent()}</span>
      ) : props.triggerLabel ? (
        <button
          type="button"
          class={resolvedClasses().trigger}
          data-slot="trigger"
          onClick={handleOpen}
        >
          {props.triggerLabel}
        </button>
      ) : null}

      <Show when={isOpen() || !unmountOnHide()}>
        <dialog
          ref={(el) => (dialogRef = el)}
          class={resolvedClasses().content}
          aria-modal="true"
          data-state={isOpen() ? "open" : "closed"}
          data-slot="content"
          {...rest}
        >
          <RLButton
            type="button"
            variant="ghost"
            color="neutral"
            size="sm"
            square
            leadingIcon="close"
            aria-label="Close modal"
            data-slot="close-button"
            class={resolvedClasses().closeButton}
            onClick={handleClose}
          />

          {props.title || props.description || resolvedTitleSlot() || resolvedDescriptionSlot() ? (
            <div class={resolvedClasses().header} data-slot="header">
              {resolvedTitleSlot() ? (
                resolvedTitleSlot()
              ) : props.title ? (
                <h3 class={resolvedClasses().title} data-slot="title">
                  {props.title}
                </h3>
              ) : null}

              {resolvedDescriptionSlot() ? (
                resolvedDescriptionSlot()
              ) : props.description ? (
                <p class={resolvedClasses().description} data-slot="description">
                  {props.description}
                </p>
              ) : null}
            </div>
          ) : null}

          {resolvedChildren()}

          {footerContent() ? (
            <div class={resolvedClasses().footer} data-slot="footer">
              {footerContent()}
            </div>
          ) : null}
        </dialog>
      </Show>
    </div>
  );
};
