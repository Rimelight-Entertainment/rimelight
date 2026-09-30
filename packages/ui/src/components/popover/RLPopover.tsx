import { createMemo, createSignal, omit, Show, onSettled, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { PopoverProps } from "./popover";
import { popoverTheme } from "./popover.theme";

export interface RLPopoverProps extends PopoverProps {
  children?: JSX.Element;
  trigger?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const RLPopover: Component<RLPopoverProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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

  const resolvedClasses = createMemo(() =>
    popoverTheme({
      size: props.size ?? "md",
      placement: props.placement ?? "bottom",
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div
      ref={(el) => (containerRef = el)}
      class={`rl-popover-host ${resolvedClasses().root}`}
      data-slot="popover-container"
      data-placement={props.placement ?? "bottom"}
      data-mode={mode()}
      {...rest}
    >
      <div
        class={resolvedClasses().trigger}
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
        <div class={resolvedClasses().content} data-slot="content">
          {props.children}
        </div>
      </Show>
    </div>
  );
};

export { RLPopover };
