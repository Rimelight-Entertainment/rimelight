import type { RLModalProps } from "./modal.types";
import { RLModalTheme } from "./modal.theme";
import { createEffect, createSignal, onSettled, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";
import { slot } from "../../slot";

const OMIT_KEYS = [
  "open",
  "defaultOpen",
  "title",
  "description",
  "portal",
  "close",
  "closeIcon",
  "dismissible",
  "lockScroll",
  "unmountOnHide",
  "triggerLabel",
  "role",
  "ariaLabel",
  "ariaLabelledby",
  "ariaDescribedby",
  "onOpenChange",
  "onClose",
  "onClosePrevent",
  "onEnter",
  "onAfterEnter",
  "onLeave",
  "onAfterLeave",
] as const;

const SLOT_KEYS = [
  "triggerSlot",
  "contentSlot",
  "headerSlot",
  "titleSlot",
  "descriptionSlot",
  "actionsSlot",
  "closeSlot",
  "bodySlot",
  "footerSlot",
] as const;

export const RLModal: Component<RLModalProps> = (props) => {
  const {
    classes,
    rest,
    slots,
    id: modalId,
  } = RLModalTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: SLOT_KEYS,
    idPrefix: "rl-modal",
  });

  const titleId = () => `${modalId()}-title`;
  const descId = () => `${modalId()}-desc`;

  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : uncontrolledOpen());

  const isModal = () => props.modal !== false;
  const isDismissible = () => props.dismissible !== false;
  const unmountOnHide = () => props.unmountOnHide !== false;
  const usePortal = () => props.portal !== false;
  // Resolved once, outside a reactive getter: Portal reads `mount` during the effect phase.
  const portalMount = typeof props.portal === "object" ? (props.portal as any) : undefined;

  let contentRef: HTMLDivElement | undefined;

  const setOpenState = (next: boolean) => {
    if (props.open === undefined) {
      setUncontrolledOpen(next);
    }
    props.onOpenChange?.(next);
    if (!next) {
      props.onClose?.();
      props.onLeave?.();
      props.onAfterLeave?.();
    } else {
      props.onEnter?.();
      props.onAfterEnter?.();
    }
  };

  const handleClose = () => {
    setOpenState(false);
  };

  const handleDismiss = () => {
    if (isDismissible()) {
      handleClose();
    } else {
      props.onClosePrevent?.();
    }
  };

  // Lock scroll
  createEffect(
    () => ({ open: isOpen(), lock: props.lockScroll !== false && isModal() }),
    ({ open, lock }) => {
      document.body.style.overflow = open && lock ? "hidden" : "";
      return () => {
        document.body.style.overflow = "";
      };
    },
  );

  // Escape key listener
  onSettled(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        handleDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  });

  // Non-modal outside click listener
  onSettled(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isOpen() || isModal()) return;
      if (contentRef && !contentRef.contains(e.target as Node)) {
        handleDismiss();
      }
    };
    document.addEventListener("click", onDocClick, true);
    return () => {
      document.removeEventListener("click", onDocClick, true);
    };
  });

  const showCloseButton = () => props.close !== false;
  const closeProps = () => (typeof props.close === "object" ? props.close : {});

  // Overlay slots are invoked here, inside the dialog render, which only runs while the
  // modal is open. Each invocation is memoized once so repeated reads (aria ids, Show
  // guards, and the markup itself) share one subtree.
  const renderModalDialog = () => {
    const contentNode = slot(() => slots.contentSlot()?.());
    const headerNode = slot(() => slots.headerSlot()?.());
    const titleNode = slot(() => slots.titleSlot()?.() ?? props.title);
    const descriptionNode = slot(() => slots.descriptionSlot()?.() ?? props.description);
    const actionsNode = slot(() => slots.actionsSlot()?.());
    const closeNode = slot(() => slots.closeSlot()?.());
    const bodyNode = slot(() => slots.bodySlot()?.() ?? props.children);
    const footerNode = slot(() => slots.footerSlot()?.());

    return (
      <div
        class={classes().overlay}
        data-slot="overlay"
        data-state={isOpen() ? "open" : "closed"}
        style={{ display: isOpen() || !unmountOnHide() ? undefined : "none" }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleDismiss();
          }
        }}
      >
        <div
          ref={(el) => (contentRef = el)}
          role={(props.role ?? "dialog") as any}
          aria-modal={isModal() ? "true" : undefined}
          aria-label={props.ariaLabel}
          aria-labelledby={props.ariaLabelledby ?? (titleNode() ? titleId() : undefined)}
          aria-describedby={props.ariaDescribedby ?? (descriptionNode() ? descId() : undefined)}
          data-state={isOpen() ? "open" : "closed"}
          data-slot="content"
          class={classes().content}
          tabindex={-1}
          onClick={(e) => e.stopPropagation()}
          {...rest}
        >
          <Show
            when={contentNode()}
            fallback={
              <>
                {/* Header / Title / Description */}
                <Show
                  when={
                    headerNode() ||
                    titleNode() ||
                    descriptionNode() ||
                    showCloseButton() ||
                    closeNode()
                  }
                >
                  <Show
                    when={headerNode()}
                    fallback={
                      <div class={classes().header} data-slot="header">
                        <div class="flex flex-col gap-1 min-w-0 flex-1">
                          <Show when={titleNode()}>
                            <h2 id={titleId()} class={classes().title} data-slot="title">
                              {titleNode()}
                            </h2>
                          </Show>
                          <Show when={descriptionNode()}>
                            <p id={descId()} class={classes().description} data-slot="description">
                              {descriptionNode()}
                            </p>
                          </Show>
                        </div>

                        <Show when={actionsNode()}>
                          <div class={classes().actions} data-slot="actions">
                            {actionsNode()}
                          </div>
                        </Show>

                        <Show when={closeNode() || showCloseButton()}>
                          <Show
                            when={closeNode()}
                            fallback={
                              <RLButton
                                type="button"
                                variant="ghost"
                                color="neutral"
                                size="sm"
                                square
                                leadingIcon={props.closeIcon ?? "x"}
                                aria-label={uiT("modal.close")}
                                data-slot="close"
                                class={classes().close}
                                onClick={handleClose}
                                {...closeProps()}
                              />
                            }
                          >
                            <span onClick={handleClose}>{closeNode()}</span>
                          </Show>
                        </Show>
                      </div>
                    }
                  >
                    <div class={classes().header} data-slot="header">
                      {headerNode()}
                    </div>
                  </Show>
                </Show>

                {/* Body */}
                <div class={classes().body} data-slot="body">
                  {bodyNode()}
                </div>

                {/* Footer */}
                <Show when={footerNode()}>
                  <div class={classes().footer} data-slot="footer">
                    {footerNode()}
                  </div>
                </Show>
              </>
            }
          >
            {contentNode()}
          </Show>
        </div>
      </div>
    );
  };

  return (
    <div class={classes().root} data-slot="root">
      <Show
        when={slots.triggerSlot()}
        fallback={
          <Show when={props.triggerLabel}>
            <RLButton
              type="button"
              class={classes().trigger}
              data-slot="trigger"
              onClick={() => setOpenState(true)}
            >
              {props.triggerLabel}
            </RLButton>
          </Show>
        }
      >
        <span
          class="inline-flex cursor-pointer"
          data-slot="trigger-wrapper"
          onClick={() => setOpenState(true)}
        >
          {slots.triggerSlot()}
        </span>
      </Show>

      <Show when={isOpen() || !unmountOnHide()}>
        <Show when={usePortal()} fallback={renderModalDialog()}>
          <Portal mount={portalMount}>{renderModalDialog()}</Portal>
        </Show>
      </Show>
    </div>
  );
};
