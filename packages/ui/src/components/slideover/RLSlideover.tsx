import type { RLSlideoverProps } from "./slideover.types";
import { RLSlideoverTheme } from "./slideover.theme";
import { createEffect, onSettled, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";
import { slot } from "../../slot";

const OMIT_KEYS = [
  "side",
  "open",
  "defaultOpen",
  "title",
  "description",
  "triggerLabel",
  "dismissible",
  "unmountOnHide",
  "onOpenChange",
  "portal",
] as const;

export const RLSlideover: Component<RLSlideoverProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLSlideoverTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot", "titleSlot", "descriptionSlot", "footerSlot"] as const,
  });

  const unmountOnHide = () => props.unmountOnHide ?? true;
  const isDismissible = () => props.dismissible ?? true;
  // Resolved once, outside a reactive getter: Portal reads `mount` during the effect phase.
  const portalMount = typeof props.portal === "object" ? props.portal : undefined;

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );

  const dismiss = () => {
    if (isDismissible()) {
      setOpen(false);
    }
  };

  createEffect(
    () => isOpen(),
    (open) => {
      document.body.style.overflow = open ? "hidden" : "";
    },
  );

  onSettled(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        dismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  });

  // Rendered inside the mounted Show child, so the memos are created once per mount. When
  // unmountOnHide is false, the content stays mounted while closed, as before.
  const renderContent = () => {
    const titleNode = slot(() => slots.titleSlot()?.() ?? props.title);
    const descriptionNode = slot(() => slots.descriptionSlot()?.() ?? props.description);
    const footerNode = slot(() => slots.footerSlot()?.());

    return (
      <>
        <Show when={isOpen() && isDismissible()}>
          <div class={classes().backdrop} data-slot="backdrop" onClick={dismiss} />
        </Show>

        <div
          class={classes().content}
          data-slot="content"
          data-state={isOpen() ? "open" : "closed"}
          style={{ display: isOpen() ? undefined : "none" }}
        >
          <Show when={isDismissible()}>
            <button
              class={classes().closeButton}
              data-slot="close-button"
              type="button"
              aria-label={uiT("slideover.close")}
              onClick={dismiss}
            >
              <RLIcon name="x" class="size-4" aria-hidden="true" />
            </button>
          </Show>

          <div class={classes().header} data-slot="header">
            <Show when={titleNode()}>
              <h3 class={classes().title} data-slot="title">
                {titleNode()}
              </h3>
            </Show>

            <Show when={descriptionNode()}>
              <p class={classes().description} data-slot="description">
                {descriptionNode()}
              </p>
            </Show>
          </div>

          <div class="flex flex-col flex-1 gap-2 overflow-y-auto">{children()}</div>

          <Show when={slots.footerSlot() !== undefined}>
            <div class={classes().footer} data-slot="footer">
              {footerNode()}
            </div>
          </Show>
        </div>
      </>
    );
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show
        when={props.triggerLabel}
        fallback={
          <span class="inline-flex cursor-pointer" onClick={() => setOpen(true)}>
            {slots.triggerSlot()}
          </span>
        }
      >
        <button
          type="button"
          class={classes().trigger}
          data-slot="trigger"
          onClick={() => setOpen(true)}
        >
          {props.triggerLabel}
        </button>
      </Show>

      <Show when={!unmountOnHide() || isOpen()}>
        <Show when={props.portal !== false} fallback={renderContent()}>
          <Portal {...(portalMount ? { mount: portalMount } : {})}>{renderContent()}</Portal>
        </Show>
      </Show>
    </Tag>
  );
};
