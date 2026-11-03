import type { RLDrawerProps } from "./drawer.types";
import { RLDrawerTheme } from "./drawer.theme";
import { createEffect, Show, onSettled, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { slot } from "../../slot";

const OMIT_KEYS = [
  "open",
  "defaultOpen",
  "direction",
  "title",
  "description",
  "triggerLabel",
  "dismissible",
  "lockScroll",
  "onOpenChange",
] as const;

export const RLDrawer: Component<RLDrawerProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLDrawerTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot", "titleSlot", "descriptionSlot", "footerSlot"] as const,
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );

  const isDismissible = () => props.dismissible ?? true;
  const lockScroll = () => props.lockScroll ?? true;

  const handleDismiss = () => {
    if (isDismissible()) {
      setOpen(false);
    }
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
      handleDismiss();
    };
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialogRef) {
        handleDismiss();
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
      >
        <div class={classes().handle} data-slot="handle" />

        <Show when={isDismissible()}>
          <button
            class={classes().closeButton}
            data-slot="close-button"
            type="button"
            aria-label={uiT("drawer.close")}
            onClick={handleDismiss}
          >
            <RLIcon name="x" size="sm" aria-hidden="true" />
          </button>
        </Show>

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

        {children()}

        {footerNode() ? (
          <div class={classes().footer} data-slot="footer">
            {footerNode()}
          </div>
        ) : null}
      </dialog>
    );
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      {props.triggerLabel ? (
        <button
          class={classes().trigger}
          data-slot="trigger"
          type="button"
          onClick={() => setOpen(true)}
        >
          {props.triggerLabel}
        </button>
      ) : slots.triggerSlot() ? (
        <span onClick={() => setOpen(true)}>{slots.triggerSlot()}</span>
      ) : null}

      <Show when={isOpen()}>{renderDialog()}</Show>
    </Tag>
  );
};
