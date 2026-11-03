import type { RLSlideoverProps } from "./slideover.types";
import { RLSlideoverTheme } from "./slideover.theme";
import { createSignal, onSettled, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { slot } from "../../slot";

const OMIT_KEYS = [
  "open",
  "defaultOpen",
  "title",
  "description",
  "triggerLabel",
  "unmountOnHide",
  "onOpenChange",
] as const;

const SLOT_KEYS = ["triggerSlot", "titleSlot", "descriptionSlot", "footerSlot"] as const;

export const RLSlideover: Component<RLSlideoverProps> = (props) => {
  const { Tag, classes, rest, slots } = RLSlideoverTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: SLOT_KEYS,
  });

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

  // Rendered inside the mounted Show child, so the memos are created once per mount. When
  // unmountOnHide is false, the content stays mounted while closed, as before.
  const renderContent = () => {
    const titleNode = slot(() => slots.titleSlot()?.() ?? props.title);
    const descriptionNode = slot(() => slots.descriptionSlot()?.() ?? props.description);
    const footerNode = slot(() => slots.footerSlot()?.());

    return (
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
            aria-label={uiT("slideover.close")}
            onClick={() => setOpenState(false)}
          >
            <RLIcon name="x" class="size-4" aria-hidden="true" />
          </button>

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

          <div class="flex flex-col flex-1 gap-2 overflow-y-auto">{props.children}</div>

          <Show when={slots.footerSlot() !== undefined}>
            <div class={classes().footer} data-slot="footer">
              {footerNode()}
            </div>
          </Show>
        </div>
      </Portal>
    );
  };

  return (
    <Tag class={classes().root} data-slot="root" {...rest}>
      <Show
        when={props.triggerLabel}
        fallback={
          <span class="inline-flex cursor-pointer" onClick={() => setOpenState(true)}>
            {slots.triggerSlot()}
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

      <Show when={!unmountOnHide() || isOpen()}>{renderContent()}</Show>
    </Tag>
  );
};
