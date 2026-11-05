import type { RLDrawerProps } from "./drawer.types";
import { RLDrawerTheme } from "./drawer.theme";
import { createEffect, Show, onSettled, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "open",
  "defaultOpen",
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

  const handleDismiss = () => {
    if (props.dismissible ?? true) {
      setOpen(false);
    }
  };

  let dialogRef: HTMLDialogElement | undefined;

  createEffect(
    () => ({ open: isOpen(), lock: props.lockScroll ?? true }),
    (state) => {
      if (state.open) {
        if (state.lock) {
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

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show
        when={props.triggerLabel}
        fallback={
          <Show when={slots.triggerSlot()}>
            <span onClick={() => setOpen(true)}>{renderSlot(slots.triggerSlot())}</span>
          </Show>
        }
      >
        <RLButton
          variant="ghost"
          color="neutral"
          class={classes().trigger}
          data-slot="trigger"
          type="button"
          onClick={() => setOpen(true)}
        >
          {props.triggerLabel}
        </RLButton>
      </Show>

      <Show when={isOpen()}>
        <dialog
          ref={(el) => (dialogRef = el)}
          class={classes().body}
          data-slot="body"
          aria-modal="true"
          data-state="open"
        >
          <div class={classes().handle} data-slot="handle" />

          <Show when={props.dismissible ?? true}>
            <RLButton
              variant="ghost"
              color="neutral"
              class={classes().close}
              data-slot="close"
              type="button"
              aria-label={uiT("drawer.close")}
              onClick={handleDismiss}
            >
              <RLIcon name="x" size="sm" aria-hidden="true" />
            </RLButton>
          </Show>

          <div class={classes().header} data-slot="header">
            <Show
              when={slots.titleSlot()}
              fallback={
                <Show when={props.title}>
                  <h3 class={classes().title} data-slot="title">
                    {props.title}
                  </h3>
                </Show>
              }
            >
              {renderSlot(slots.titleSlot())}
            </Show>

            <Show
              when={slots.descriptionSlot()}
              fallback={
                <Show when={props.description}>
                  <p class={classes().description} data-slot="description">
                    {props.description}
                  </p>
                </Show>
              }
            >
              {renderSlot(slots.descriptionSlot())}
            </Show>
          </div>

          {children()}

          <Show when={slots.footerSlot()}>
            <div class={classes().footer} data-slot="footer">
              {renderSlot(slots.footerSlot())}
            </div>
          </Show>
        </dialog>
      </Show>
    </Tag>
  );
};
