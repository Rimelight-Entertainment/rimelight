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
import { Portal } from "@solidjs/web";
import { RLButton } from "../button/RLButton";
import { createSlotResolver, evalSlot } from "../../internal/slots";

export const RLModal: Component<RLModalProps> = (allProps) => {
  const props = allProps;
  const uniqueId = createUniqueId();
  const titleId = `rl-modal-title-${uniqueId}`;
  const descId = `rl-modal-desc-${uniqueId}`;

  const rest = omit(
    allProps,
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
    "aria-label" as any,
    "ariaLabelledby",
    "aria-labelledby" as any,
    "ariaDescribedby",
    "aria-describedby" as any,
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

  const resolvedClasses = createMemo(() =>
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

  const resolvedChildren = createSlotResolver(() => props.children);
  const BODY_EXCLUDE = [
    "trigger",
    "header",
    "title",
    "description",
    "actions",
    "close",
    "footer",
    "content",
  ] as const;

  const triggerContent = () =>
    evalSlot(props.triggerSlot ?? props.trigger ?? resolvedChildren.find("trigger"));
  const contentSlotContent = () =>
    evalSlot(props.contentSlot ?? props.content ?? resolvedChildren.find("content"));
  const headerSlotContent = () =>
    evalSlot(props.headerSlot ?? props.header ?? resolvedChildren.find("header"));
  const titleContent = () =>
    evalSlot(props.titleSlot ?? resolvedChildren.find("title") ?? props.title);
  const descriptionContent = () =>
    evalSlot(props.descriptionSlot ?? resolvedChildren.find("description") ?? props.description);
  const actionsContent = () =>
    evalSlot(props.actionsSlot ?? props.actions ?? resolvedChildren.find("actions"));
  const closeSlotContent = () => evalSlot(props.closeSlot ?? resolvedChildren.find("close"));
  const footerContent = () =>
    evalSlot(props.footerSlot ?? props.footer ?? resolvedChildren.find("footer"));
  const bodyContent = () =>
    evalSlot(
      props.bodySlot ??
        props.body ??
        resolvedChildren.find("body") ??
        resolvedChildren.body(BODY_EXCLUDE),
    );

  const showCloseButton = () => props.close !== false;
  const closeProps = () => (typeof props.close === "object" ? props.close : {});

  const renderModalDialog = () => (
    <div
      class={resolvedClasses().overlay}
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
        aria-label={props.ariaLabel ?? props["aria-label"]}
        aria-labelledby={
          props.ariaLabelledby ?? props["aria-labelledby"] ?? (titleContent() ? titleId : undefined)
        }
        aria-describedby={
          props.ariaDescribedby ??
          props["aria-describedby"] ??
          (descriptionContent() ? descId : undefined)
        }
        data-state={isOpen() ? "open" : "closed"}
        data-slot="content"
        class={resolvedClasses().content}
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
                    <div class={resolvedClasses().header} data-slot="header">
                      <div class="flex flex-col gap-1 min-w-0 flex-1">
                        <Show when={titleContent()}>
                          <h2 id={titleId} class={resolvedClasses().title} data-slot="title">
                            {titleContent()}
                          </h2>
                        </Show>
                        <Show when={descriptionContent()}>
                          <p
                            id={descId}
                            class={resolvedClasses().description}
                            data-slot="description"
                          >
                            {descriptionContent()}
                          </p>
                        </Show>
                      </div>

                      <Show when={actionsContent()}>
                        <div class={resolvedClasses().actions} data-slot="actions">
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
                              class={resolvedClasses().close}
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
                  <div class={resolvedClasses().header} data-slot="header">
                    {headerSlotContent()}
                  </div>
                </Show>
              </Show>

              {/* Body */}
              <div class={resolvedClasses().body} data-slot="body">
                {bodyContent()}
              </div>

              {/* Footer */}
              <Show when={footerContent()}>
                <div class={resolvedClasses().footer} data-slot="footer">
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
    <div class={resolvedClasses().root} data-slot="root">
      <Show
        when={triggerContent()}
        fallback={
          <Show when={props.triggerLabel}>
            <RLButton
              type="button"
              class={resolvedClasses().trigger}
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
