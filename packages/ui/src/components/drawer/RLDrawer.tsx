import {
  createEffect,
  createMemo,
  createSignal,
  omit,
  Show,
  onSettled,
  type Component
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { DrawerProps } from "./drawer";
import { drawerTheme } from "./drawer.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLDrawerProps extends DrawerProps {
  children?: JSX.Element;
  trigger?: JSX.Element;
  triggerSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  footer?: JSX.Element;
  footerSlot?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
  lockScroll?: boolean;
}

const RLDrawer: Component<RLDrawerProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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
    "lockScroll"
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
    }
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

  const resolvedClasses = createMemo(() =>
    drawerTheme({
      direction: props.direction ?? "bottom",
      ui: props.ui,
      class: props.class
    })
  );

  const triggerContent = () => props.trigger ?? props.triggerSlot;
  const footerContent = () => props.footer ?? props.footerSlot;

  return (
    <div class={resolvedClasses().root} data-slot="drawer-container">
      {props.triggerLabel ? (
        <button
          class={resolvedClasses().trigger}
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
          class={`${resolvedClasses().content} ${isOpen() ? "" : "hidden"}`}
          data-slot="content"
          aria-modal="true"
          data-state={isOpen() ? "open" : "closed"}
          {...rest}
        >
          <div class={resolvedClasses().handle} data-slot="handle" />

          <button
            class={resolvedClasses().closeButton}
            data-slot="close-button"
            type="button"
            aria-label="Close drawer"
            onClick={() => handleOpenChange(false)}
          >
            <RLIcon name="close" size="sm" aria-hidden="true" />
          </button>

          <div class={resolvedClasses().header} data-slot="header">
            {props.titleSlot ? (
              props.titleSlot
            ) : props.title ? (
              <h3 class={resolvedClasses().title} data-slot="title">
                {props.title}
              </h3>
            ) : null}

            {props.descriptionSlot ? (
              props.descriptionSlot
            ) : props.description ? (
              <p class={resolvedClasses().description} data-slot="description">
                {props.description}
              </p>
            ) : null}
          </div>

          {props.children}

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

export { RLDrawer };
