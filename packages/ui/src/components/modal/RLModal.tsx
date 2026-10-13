import type { RLModalProps } from "./modal.types";
import { RLModalTheme } from "./modal.theme";
import {
  children as resolveChildren,
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
    "className",
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
    "onUpdateOpen",
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
    props.onUpdateOpen?.(next);
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
      if (typeof document !== "undefined") {
        if (open && lock) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "";
        }
      }
    },
  );

  onCleanup(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
  });

  // Escape key listener
  onSettled(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        e.preventDefault();
        handleDismiss();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("keydown", onKeyDown);
      };
    }
    return () => {};
  });

  // Non-modal outside click listener
  onSettled(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!isOpen() || isModal()) return;
      if (contentRef && !contentRef.contains(e.target as Node)) {
        handleDismiss();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("click", onDocClick, true);
      return () => {
        document.removeEventListener("click", onDocClick, true);
      };
    }
    return () => {};
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
      class: props.class ?? props.className,
    }),
  );

  const resolvedChildren = resolveChildren(() =>
    typeof props.children === "function" ? (props.children as () => any)() : props.children,
  );

  const getSlotChild = (name: string) => {
    const all = resolvedChildren();
    const arr = Array.isArray(all) ? all : all ? [all] : [];
    return arr.find((child: any) => {
      if (!child) return false;
      if (typeof child === "object") {
        const s =
          child.slot ??
          child["data-slot"] ??
          child?.props?.slot ??
          child?.props?.["data-slot"] ??
          (typeof child.getAttribute === "function"
            ? child.getAttribute("slot") || child.getAttribute("data-slot")
            : undefined);
        return s === name;
      }
      return false;
    });
  };

  const getBodyChildren = () => {
    const all = resolvedChildren();
    const arr = Array.isArray(all) ? all : all ? [all] : [];
    return arr.filter((child: any) => {
      if (!child) return false;
      if (typeof child === "object") {
        const s =
          child.slot ??
          child["data-slot"] ??
          child?.props?.slot ??
          child?.props?.["data-slot"] ??
          (typeof child.getAttribute === "function"
            ? child.getAttribute("slot") || child.getAttribute("data-slot")
            : undefined);
        if (
          s === "trigger" ||
          s === "header" ||
          s === "title" ||
          s === "description" ||
          s === "actions" ||
          s === "close" ||
          s === "footer" ||
          s === "content"
        ) {
          return false;
        }
      }
      return true;
    });
  };

  const evalSlot = (slot: any) => (typeof slot === "function" ? slot() : slot);

  const triggerContent = () =>
    evalSlot(props.triggerSlot ?? props.trigger ?? getSlotChild("trigger"));
  const contentSlotContent = () =>
    evalSlot(props.contentSlot ?? props.content ?? getSlotChild("content"));
  const headerSlotContent = () =>
    evalSlot(props.headerSlot ?? props.header ?? getSlotChild("header"));
  const titleContent = () => evalSlot(props.titleSlot ?? getSlotChild("title") ?? props.title);
  const descriptionContent = () =>
    evalSlot(props.descriptionSlot ?? getSlotChild("description") ?? props.description);
  const actionsContent = () =>
    evalSlot(props.actionsSlot ?? props.actions ?? getSlotChild("actions"));
  const closeSlotContent = () => evalSlot(props.closeSlot ?? getSlotChild("close"));
  const footerContent = () => evalSlot(props.footerSlot ?? props.footer ?? getSlotChild("footer"));
  const bodyContent = () =>
    evalSlot(props.bodySlot ?? props.body ?? getSlotChild("body") ?? getBodyChildren());

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
