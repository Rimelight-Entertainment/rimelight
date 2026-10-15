import type { RLPopoverProps } from "./popover.types";
import { RLPopoverTheme } from "./popover.theme";
import { createMemo, createSignal, omit, Show, onSettled, type Component } from "solid-js";

export const RLPopover: Component<RLPopoverProps> = (props) => {
  const rest = omit(
    props,
    "open",
    "defaultOpen",
    "triggerLabel",
    "placement",
    "mode",
    "ui",
    "class",
    "children",
    "trigger",
    "onOpenChange",
  );

  const [isOpen, setIsOpen] = createSignal(props.open ?? props.defaultOpen ?? false);
  const [isHovered, setIsHovered] = createSignal(false);

  const mode = () => props.mode ?? "both";
  const isVisible = () => isOpen() || isHovered();

  let containerRef: HTMLDivElement | undefined;

  const handleOpenChange = (next: boolean) => {
    setIsOpen(next);
    props.onOpenChange?.(next);
  };

  const handleHoverShow = () => {
    setIsHovered(true);
  };

  const handleHoverHide = () => {
    setIsHovered(false);
  };

  onSettled(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen() && containerRef && !containerRef.contains(e.target as Node)) {
        handleOpenChange(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  });

  const classes = createMemo(() =>
    RLPopoverTheme({
      size: props.size ?? "md",
      placement: props.placement ?? "bottom",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div
      ref={(el) => (containerRef = el)}
      class={`rl-popover-host ${classes().root}`}
      data-slot="popover-container"
      data-placement={props.placement ?? "bottom"}
      data-mode={mode()}
      {...rest}
    >
      <div
        class={classes().trigger}
        data-slot="trigger"
        onClick={(e) => {
          e.stopPropagation();
          if (mode() === "click" || mode() === "both") handleOpenChange(!isOpen());
        }}
        onMouseEnter={() => {
          if (mode() === "hover" || mode() === "both") handleHoverShow();
        }}
        onMouseLeave={() => {
          if (mode() === "hover" || mode() === "both") handleHoverHide();
        }}
      >
        {props.trigger ??
          (props.triggerLabel ? (
            <button type="button" class="cursor-pointer">
              {props.triggerLabel}
            </button>
          ) : null)}
      </div>

      <Show when={isVisible()}>
        <div class={classes().content} data-slot="content">
          {props.children}
        </div>
      </Show>
    </div>
  );
};
