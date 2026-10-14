import type { RLSlideoverProps } from "./slideover.types";
import { RLSlideoverTheme } from "./slideover.theme";
import {
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  Show,
  omit,
  type Component,
} from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { createSlotResolver, evalSlot } from "../../internal/slots";

export const RLSlideover: Component<RLSlideoverProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "side",
    "open",
    "defaultOpen",
    "title",
    "description",
    "triggerLabel",
    "unmountOnHide",
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
  );

  const side = () => props.side ?? "left";
  const unmountOnHide = () => props.unmountOnHide ?? true;

  const [isOpen, setIsOpen] = createSignal(props.open ?? props.defaultOpen ?? false);

  createEffect(
    () => props.open,
    (open) => {
      if (open !== undefined) {
        setIsOpen(open);
      }
    },
  );

  const setOpenState = (open: boolean) => {
    if (props.open === undefined) {
      setIsOpen(open);
    }
    document.body.style.overflow = open ? "hidden" : "";
    props.onOpenChange?.(open);
  };

  onSettled(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        setOpenState(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  });

  const resolvedClasses = createMemo(() =>
    RLSlideoverTheme({
      side: side(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const resolvedChildren = createSlotResolver(() => props.children);
  const BODY_EXCLUDE = ["trigger", "footer", "title", "description"] as const;

  const getBodyChildren = () => {
    if (!props.children) return null;
    if (
      props.trigger ||
      props.triggerSlot ||
      props.footer ||
      props.footerSlot ||
      props.titleSlot ||
      props.descriptionSlot
    ) {
      return props.children;
    }
    const filtered = resolvedChildren.body(BODY_EXCLUDE);
    return filtered.length > 0 ? filtered : props.children;
  };

  const triggerContent = () =>
    evalSlot(props.trigger ?? props.triggerSlot ?? resolvedChildren.find("trigger"));
  const footerContent = () =>
    evalSlot(props.footer ?? props.footerSlot ?? resolvedChildren.find("footer"));
  const titleContent = () =>
    evalSlot(props.titleSlot ?? props.title ?? resolvedChildren.find("title"));
  const descriptionContent = () =>
    evalSlot(props.descriptionSlot ?? props.description ?? resolvedChildren.find("description"));

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <Show
        when={props.triggerLabel}
        fallback={
          <span class="inline-flex cursor-pointer" onClick={() => setOpenState(true)}>
            {triggerContent()}
          </span>
        }
      >
        <button
          type="button"
          class={resolvedClasses().trigger}
          data-slot="trigger"
          onClick={() => setOpenState(true)}
        >
          {props.triggerLabel}
        </button>
      </Show>

      <Show when={!unmountOnHide() || isOpen()}>
        <Portal>
          <Show when={isOpen()}>
            <div
              class={resolvedClasses().backdrop}
              data-slot="backdrop"
              onClick={() => setOpenState(false)}
            />
          </Show>

          <div
            class={resolvedClasses().content}
            data-slot="content"
            data-state={isOpen() ? "open" : "closed"}
            style={{ display: isOpen() ? undefined : "none" }}
          >
            <button
              class={resolvedClasses().closeButton}
              data-slot="close-button"
              type="button"
              aria-label="Close slideover"
              onClick={() => setOpenState(false)}
            >
              <RLIcon name="x" class="size-4" aria-hidden="true" />
            </button>

            <div class={resolvedClasses().header} data-slot="header">
              <Show when={titleContent()}>
                <h3 class={resolvedClasses().title} data-slot="title">
                  {titleContent()}
                </h3>
              </Show>

              <Show when={descriptionContent()}>
                <p class={resolvedClasses().description} data-slot="description">
                  {descriptionContent()}
                </p>
              </Show>
            </div>

            <div class="flex flex-col flex-1 gap-2 overflow-y-auto">{getBodyChildren()}</div>

            <Show when={footerContent() !== undefined}>
              <div class={resolvedClasses().footer} data-slot="footer">
                {footerContent()}
              </div>
            </Show>
          </div>
        </Portal>
      </Show>
    </div>
  );
};
