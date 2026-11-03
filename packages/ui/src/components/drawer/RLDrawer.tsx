import type { RLDrawerProps } from "./drawer.types";
import { RLDrawerTheme } from "./drawer.theme";
import { createEffect, createSignal, Show, onSettled, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { slot } from "../../slot";

const OMIT_KEYS = [
  "open",
  "defaultOpen",
  "title",
  "description",
  "triggerLabel",
  "onOpenChange",
  "closeOnClickOutside",
  "closeOnEscape",
  "lockScroll",
] as const;

const SLOT_KEYS = ["triggerSlot", "titleSlot", "descriptionSlot", "footerSlot"] as const;

export const RLDrawer: Component<RLDrawerProps> = (props) => {
  const { classes, rest, slots } = RLDrawerTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: SLOT_KEYS,
  });

  const [isOpen, setIsOpen] = createSignal(props.open ?? props.defaultOpen ?? false);

  const closeOnClickOutside = () => props.closeOnClickOutside !== false;
  const closeOnEscape = () => props.closeOnEscape !== false;
  const lockScroll = () => props.lockScroll !== false;

  const handleOpenChange = (next: boolean) => {
    setIsOpen(next);
    props.onOpenChange?.(next);
  };

  let dialogRef: HTMLDialogElement | undefined;

  createEffect(
    () => ({ open: isOpen(), lock: lockScroll() }),
    ({ open, lock }) => {
      if (open) {
        if (lock) {
          document.body.style.overflow = "hidden";
        }
        if (dialogRef && !dialogRef.open) dialogRef.showModal();
      } else {
        document.body.style.overflow = "";
        if (dialogRef && dialogRef.open) dialogRef.close();
      }
    },
  );

  onSettled(() => {
    const handleCancel = (e: Event) => {
      if (e.target !== dialogRef) return;
      e.preventDefault();
      if (closeOnEscape()) handleOpenChange(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (closeOnClickOutside() && e.target === dialogRef) {
        handleOpenChange(false);
      }
    };
    document.addEventListener("cancel", handleCancel);
    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("cancel", handleCancel);
      document.removeEventListener("click", handleClick);
      document.body.style.overflow = "";
    };
  });

  // Overlay slots are invoked inside the dialog render, which only runs while open.
  const renderDialog = () => {
    const titleNode = slot(() => slots.titleSlot()?.());
    const descriptionNode = slot(() => slots.descriptionSlot()?.());
    const footerNode = slot(() => slots.footerSlot()?.());

    return (
      <dialog
        ref={(el) => (dialogRef = el)}
        class={`${classes().content} ${isOpen() ? "" : "hidden"}`}
        data-slot="content"
        aria-modal="true"
        data-state={isOpen() ? "open" : "closed"}
        {...rest}
      >
        <div class={classes().handle} data-slot="handle" />

        <button
          class={classes().closeButton}
          data-slot="close-button"
          type="button"
          aria-label={uiT("drawer.close")}
          onClick={() => handleOpenChange(false)}
        >
          <RLIcon name="x" size="sm" aria-hidden="true" />
        </button>

        <div class={classes().header} data-slot="header">
          {titleNode() ? (
            titleNode()
          ) : props.title ? (
            <h3 class={classes().title} data-slot="title">
              {props.title}
            </h3>
          ) : null}

          {descriptionNode() ? (
            descriptionNode()
          ) : props.description ? (
            <p class={classes().description} data-slot="description">
              {props.description}
            </p>
          ) : null}
        </div>

        {props.children}

        {footerNode() ? (
          <div class={classes().footer} data-slot="footer">
            {footerNode()}
          </div>
        ) : null}
      </dialog>
    );
  };

  return (
    <div class={classes().root} data-slot="drawer-container">
      {props.triggerLabel ? (
        <button
          class={classes().trigger}
          data-slot="trigger"
          type="button"
          onClick={() => handleOpenChange(true)}
        >
          {props.triggerLabel}
        </button>
      ) : slots.triggerSlot() ? (
        <span onClick={() => handleOpenChange(true)}>{slots.triggerSlot()}</span>
      ) : null}

      <Show when={isOpen()}>{renderDialog()}</Show>
    </div>
  );
};
