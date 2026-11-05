import type { RLSlideoverProps } from "./slideover.types";
import { RLSlideoverTheme } from "./slideover.theme";
import { createEffect, createMemo, onSettled, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
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
  "unmountOnHide",
  "onOpenChange",
  "portal",
] as const;

export const RLSlideover: Component<RLSlideoverProps> = (props) => {
  const { Tag, classes, rest, slots, theme, children } = RLSlideoverTheme.setup(props, {
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

  const triggerNode = createMemo(() => renderSlot(slots.triggerSlot()));

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
  // unmountOnHide is false, the content stays mounted while closed.
  const renderContent = () => {
    const titleNode = createMemo(() => renderSlot(slots.titleSlot()) ?? props.title);
    const descriptionNode = createMemo(
      () => renderSlot(slots.descriptionSlot()) ?? props.description,
    );
    const footerNode = createMemo(() => renderSlot(slots.footerSlot()));

    return (
      <>
        <Show when={isDismissible()}>
          <Show when={isOpen()}>
            <div class={classes().backdrop} data-slot="backdrop" onClick={dismiss} />
          </Show>
        </Show>

        <div
          class={classes().content}
          data-slot="content"
          data-state={isOpen() ? "open" : "closed"}
        >
          <Show when={isDismissible()}>
            <RLButton
              variant="ghost"
              color="neutral"
              class={classes().close}
              data-slot="close"
              type="button"
              aria-label={uiT("slideover.close")}
              onClick={dismiss}
            >
              <RLIcon name="x" class={classes().closeIcon} />
            </RLButton>
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

          <div class={classes().body} data-slot="body">
            {children()}
          </div>

          <Show when={footerNode()}>
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
          <span
            class={classes().triggerWrapper}
            data-slot="trigger-wrapper"
            onClick={() => setOpen(true)}
          >
            {triggerNode()}
          </span>
        }
      >
        <RLButton
          variant="ghost"
          color="neutral"
          type="button"
          class={classes().trigger}
          data-slot="trigger"
          onClick={() => setOpen(true)}
        >
          {props.triggerLabel}
        </RLButton>
      </Show>

      <Show when={!unmountOnHide() || isOpen()}>
        <Show when={props.portal !== false} fallback={renderContent()}>
          <Portal {...(portalMount ? { mount: portalMount } : {})}>{renderContent()}</Portal>
        </Show>
      </Show>
    </Tag>
  );
};
