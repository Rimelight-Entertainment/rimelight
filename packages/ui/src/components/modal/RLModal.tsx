import type { RLModalProps } from "./modal.types";
import { RLModalTheme } from "./modal.theme";
import {
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onSettled,
  Show,
  omit,
  type Component,
} from "solid-js";
import { Portal, type JSX } from "@solidjs/web";
import { RLButton } from "../button/RLButton";

export const RLModal: Component<RLModalProps> = (props) => {
  const uniqueId = createUniqueId();
  const titleId = `rl-modal-title-${uniqueId}`;
  const descId = `rl-modal-desc-${uniqueId}`;

  const rest = omit(
    props,
    "open",
    "defaultOpen",
    "title",
    "description",
    "size",
    "overlay",
    "scrollable",
    "transition",
    "fullscreen",
    "portal",
    "close",
    "closeIcon",
    "dismissible",
    "modal",
    "lockScroll",
    "unmountOnHide",
    "triggerLabel",
    "role",
    "ariaLabel",
    "ariaLabelledby",
    "ariaDescribedby",
    "ui",
    "class",
    "children",
    "trigger",
    "triggerSlot",
    "content",
    "contentSlot",
    "header",
    "headerSlot",
    "titleSlot",
    "descriptionSlot",
    "actions",
    "actionsSlot",
    "closeSlot",
    "body",
    "bodySlot",
    "footer",
    "footerSlot",
    "onOpenChange",
    "onClose",
    "onClosePrevent",
    "onEnter",
    "onAfterEnter",
    "onLeave",
    "onAfterLeave",
  );

  const [uncontrolledOpen, setUncontrolledOpen] = createSignal(props.defaultOpen ?? false);
  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : uncontrolledOpen());

  const isModal = () => props.modal !== false;
  const isOverlay = () => props.overlay !== false;
  const isDismissible = () => props.dismissible !== false;
  const isScrollable = () => Boolean(props.scrollable);
  const isFullscreen = () => Boolean(props.fullscreen);
  const isTransition = () => props.transition !== false;
  const unmountOnHide = () => props.unmountOnHide !== false;
  const usePortal = () => props.portal !== false;

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
    },
  );

  onCleanup(() => {
    document.body.style.overflow = "";
  });

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

  const classes = createMemo(() =>
    RLModalTheme({
      size: props.size ?? "md",
      transition: isTransition(),
      fullscreen: isFullscreen(),
      overlay: isOverlay(),
      modal: isModal(),
      scrollable: isScrollable(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const resolveSlot = (slot: unknown): JSX.Element =>
    typeof slot === "function" ? (slot as () => JSX.Element)() : (slot as JSX.Element);

  const triggerContent = () => resolveSlot(props.triggerSlot ?? props.trigger);
  const contentSlotContent = () => resolveSlot(props.contentSlot ?? props.content);
  const headerSlotContent = () => resolveSlot(props.headerSlot ?? props.header);
  const titleContent = () => resolveSlot(props.titleSlot ?? props.title);
  const descriptionContent = () => resolveSlot(props.descriptionSlot ?? props.description);
  const actionsContent = () => resolveSlot(props.actionsSlot ?? props.actions);
  const closeSlotContent = () => resolveSlot(props.closeSlot);
  const footerContent = () => resolveSlot(props.footerSlot ?? props.footer);
  const bodyContent = () => resolveSlot(props.bodySlot ?? props.body ?? props.children);

  const showCloseButton = () => props.close !== false;
  const closeProps = () => (typeof props.close === "object" ? props.close : {});

  const renderModalDialog = () => (
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
        aria-labelledby={props.ariaLabelledby ?? (titleContent() ? titleId : undefined)}
        aria-describedby={props.ariaDescribedby ?? (descriptionContent() ? descId : undefined)}
        data-state={isOpen() ? "open" : "closed"}
        data-slot="content"
        class={classes().content}
        tabindex={-1}
        onClick={(e) => e.stopPropagation()}
        {...rest}
      >
        <Show
          when={contentSlotContent()}
          fallback={
            <>
              {/* Header / Title / Description */}
              <Show
                when={
                  headerSlotContent() ||
                  titleContent() ||
                  descriptionContent() ||
                  showCloseButton() ||
                  closeSlotContent()
                }
              >
                <Show
                  when={headerSlotContent()}
                  fallback={
                    <div class={classes().header} data-slot="header">
                      <div class="flex flex-col gap-1 min-w-0 flex-1">
                        <Show when={titleContent()}>
                          <h2 id={titleId} class={classes().title} data-slot="title">
                            {titleContent()}
                          </h2>
                        </Show>
                        <Show when={descriptionContent()}>
                          <p id={descId} class={classes().description} data-slot="description">
                            {descriptionContent()}
                          </p>
                        </Show>
                      </div>

                      <Show when={actionsContent()}>
                        <div class={classes().actions} data-slot="actions">
                          {actionsContent()}
                        </div>
                      </Show>

                      <Show when={closeSlotContent() || showCloseButton()}>
                        <Show
                          when={closeSlotContent()}
                          fallback={
                            <RLButton
                              type="button"
                              variant="ghost"
                              color="neutral"
                              size="sm"
                              square
                              leadingIcon={props.closeIcon ?? "x"}
                              aria-label="Close modal"
                              data-slot="close"
                              class={classes().close}
                              onClick={handleClose}
                              {...closeProps()}
                            />
                          }
                        >
                          <span onClick={handleClose}>{closeSlotContent()}</span>
                        </Show>
                      </Show>
                    </div>
                  }
                >
                  <div class={classes().header} data-slot="header">
                    {headerSlotContent()}
                  </div>
                </Show>
              </Show>

              {/* Body */}
              <div class={classes().body} data-slot="body">
                {bodyContent()}
              </div>

              {/* Footer */}
              <Show when={footerContent()}>
                <div class={classes().footer} data-slot="footer">
                  {footerContent()}
                </div>
              </Show>
            </>
          }
        >
          {contentSlotContent()}
        </Show>
      </div>
    </div>
  );

  return (
    <div class={classes().root} data-slot="root">
      <Show
        when={triggerContent()}
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
          {triggerContent()}
        </span>
      </Show>

      <Show when={isOpen() || !unmountOnHide()}>
        <Show when={usePortal()} fallback={renderModalDialog()}>
          <Portal mount={typeof props.portal === "object" ? (props.portal as any) : undefined}>
            {renderModalDialog()}
          </Portal>
        </Show>
      </Show>
    </div>
  );
};
