import type { RLDrawerProps } from "./drawer.types";
import { RLDrawerTheme } from "./drawer.theme";
import {
  createEffect,
  createMemo,
  createSignal,
  omit,
  Show,
  onSettled,
  type Component,
} from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export const RLDrawer: Component<RLDrawerProps> = (props) => {
  const rest = omit(
    props,
    "open",
    "defaultOpen",
    "direction",
    "title",
    "description",
    "triggerLabel",
    "ui",
    "class",
    "children",
    "trigger",
    "triggerSlot",
    "titleSlot",
    "descriptionSlot",
    "footer",
    "footerSlot",
    "onOpenChange",
    "closeOnClickOutside",
    "closeOnEscape",
    "lockScroll",
  );

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

  const classes = createMemo(() =>
    RLDrawerTheme({
      direction: props.direction ?? "bottom",
      ui: props.ui,
      class: props.class,
    }),
  );

  const triggerContent = () => props.trigger ?? props.triggerSlot;
  const footerContent = () => props.footer ?? props.footerSlot;

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
      ) : triggerContent() ? (
        <span onClick={() => handleOpenChange(true)}>{triggerContent()}</span>
      ) : null}

      <Show when={isOpen()}>
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
            aria-label="Close drawer"
            onClick={() => handleOpenChange(false)}
          >
            <RLIcon name="x" size="sm" aria-hidden="true" />
          </button>

          <div class={classes().header} data-slot="header">
            {props.titleSlot ? (
              props.titleSlot
            ) : props.title ? (
              <h3 class={classes().title} data-slot="title">
                {props.title}
              </h3>
            ) : null}

            {props.descriptionSlot ? (
              props.descriptionSlot
            ) : props.description ? (
              <p class={classes().description} data-slot="description">
                {props.description}
              </p>
            ) : null}
          </div>

          {props.children}

          {footerContent() ? (
            <div class={classes().footer} data-slot="footer">
              {footerContent()}
            </div>
          ) : null}
        </dialog>
      </Show>
    </div>
  );
};
