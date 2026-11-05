import type { RLModalProps } from "./modal.types";
import { RLModalTheme } from "./modal.theme";
import { createEffect, onSettled, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { createControllable } from "../../controllable";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";
import { slot } from "../../slot";

const OMIT_KEYS = [
  "open",
  "defaultOpen",
  "title",
  "description",
  "portal",
  "dismissible",
  "closeIcon",
  "lockScroll",
  "unmountOnHide",
  "triggerLabel",
  "role",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "onOpenChange",
  "onEnter",
  "onAfterEnter",
  "onLeave",
  "onAfterLeave",
] as const;

export const RLModal: Component<RLModalProps> = (props) => {
  const { Tag, classes, rest, slots, id, children, theme } = RLModalTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: [
      "triggerSlot",
      "headerSlot",
      "titleSlot",
      "descriptionSlot",
      "actionsSlot",
      "closeSlot",
      "bodySlot",
      "footerSlot",
    ] as const,
  });

  const titleId = () => `${id()}-title`;
  const descId = () => `${id()}-desc`;

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );

  const isModal = () => props.modal ?? true;
  const isDismissible = () => props.dismissible ?? true;
  const unmountOnHide = () => props.unmountOnHide ?? true;
  const usePortal = () => props.portal !== false;
  // Resolved once, outside a reactive getter: Portal reads `mount` during the effect phase.
  const portalMount = typeof props.portal === "object" ? props.portal : undefined;

  let contentRef: HTMLDivElement | undefined;

  const setOpenState = (next: boolean) => {
    setOpen(next);
    if (next) {
      props.onEnter?.();
      props.onAfterEnter?.();
    } else {
      props.onLeave?.();
      props.onAfterLeave?.();
    }
  };

  const handleDismiss = () => {
    if (isDismissible()) {
      setOpenState(false);
    }
  };

  // Lock scroll
  createEffect(
    () => ({ open: isOpen(), lock: (props.lockScroll ?? true) && isModal() }),
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

  // Overlay slots are invoked here, inside the dialog render, which only runs while the
  // modal is open. Each invocation is memoized once so repeated reads (aria ids, Show
  // guards, and the markup itself) share one subtree.
  const renderModalDialog = () => {
    const headerNode = slot(() => slots.headerSlot()?.());
    const titleNode = slot(() => slots.titleSlot()?.() ?? props.title);
    const descriptionNode = slot(() => slots.descriptionSlot()?.() ?? props.description);
    const actionsNode = slot(() => slots.actionsSlot()?.());
    const closeNode = slot(() => slots.closeSlot()?.());
    const bodyNode = slot(() => slots.bodySlot()?.() ?? children());
    const footerNode = slot(() => slots.footerSlot()?.());

    return (
      <div
        class={`${classes().overlay}${isOpen() || !unmountOnHide() ? "" : " hidden!"}`}
        data-slot="overlay"
        data-state={isOpen() ? "open" : "closed"}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleDismiss();
          }
        }}
      >
        <div
          ref={(el) => (contentRef = el)}
          role={props.role ?? "dialog"}
          aria-modal={isModal() ? "true" : undefined}
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-labelledby"] ?? (titleNode() ? titleId() : undefined)}
          aria-describedby={props["aria-describedby"] ?? (descriptionNode() ? descId() : undefined)}
          data-state={isOpen() ? "open" : "closed"}
          data-slot="content"
          class={classes().content}
          tabindex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <Show
            when={
              headerNode() || titleNode() || descriptionNode() || isDismissible() || closeNode()
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

                  <Show when={closeNode() || isDismissible()}>
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
                          onClick={handleDismiss}
                        />
                      }
                    >
                      <span onClick={handleDismiss}>{closeNode()}</span>
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
        </div>
      </div>
    );
  };

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
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
          class={classes().triggerWrapper}
          data-slot="trigger-wrapper"
          onClick={() => setOpenState(true)}
        >
          {slots.triggerSlot()}
        </span>
      </Show>

      <Show when={isOpen() || !unmountOnHide()}>
        <Show when={usePortal()} fallback={renderModalDialog()}>
          <Portal {...(portalMount ? { mount: portalMount } : {})}>{renderModalDialog()}</Portal>
        </Show>
      </Show>
    </Tag>
  );
};
