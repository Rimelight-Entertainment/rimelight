import type { RLSlideoverProps } from "./slideover.types";
import { RLSlideoverTheme } from "./slideover.theme";
import { createMemo, createSignal, onSettled, Show, omit, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";

export const RLSlideover: Component<RLSlideoverProps> = (props) => {
  const rest = omit(
    props,
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

  const [isOpen, setIsOpen] = createSignal(() => props.open ?? props.defaultOpen ?? false);

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

  const classes = createMemo(() =>
    RLSlideoverTheme({
      side: side(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const triggerContent = () => props.trigger ?? props.triggerSlot;
  const footerContent = () => props.footer ?? props.footerSlot;
  const titleContent = () => props.titleSlot ?? props.title;
  const descriptionContent = () => props.descriptionSlot ?? props.description;
  const getBodyChildren = () => props.children;

  return (
    <div class={classes().root} data-slot="root" {...rest}>
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
          class={classes().trigger}
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
              class={classes().backdrop}
              data-slot="backdrop"
              onClick={() => setOpenState(false)}
            />
          </Show>

          <div
            class={classes().content}
            data-slot="content"
            data-state={isOpen() ? "open" : "closed"}
            style={{ display: isOpen() ? undefined : "none" }}
          >
            <button
              class={classes().closeButton}
              data-slot="close-button"
              type="button"
              aria-label="Close slideover"
              onClick={() => setOpenState(false)}
            >
              <RLIcon name="x" class="size-4" aria-hidden="true" />
            </button>

            <div class={classes().header} data-slot="header">
              <Show when={titleContent()}>
                <h3 class={classes().title} data-slot="title">
                  {titleContent()}
                </h3>
              </Show>

              <Show when={descriptionContent()}>
                <p class={classes().description} data-slot="description">
                  {descriptionContent()}
                </p>
              </Show>
            </div>

            <div class="flex flex-col flex-1 gap-2 overflow-y-auto">{getBodyChildren()}</div>

            <Show when={footerContent() !== undefined}>
              <div class={classes().footer} data-slot="footer">
                {footerContent()}
              </div>
            </Show>
          </div>
        </Portal>
      </Show>
    </div>
  );
};
