import type { RLPopoverProps } from "./popover.types";
import { RLPopoverTheme } from "./popover.theme";
import { createSignal, Show, onSettled, type Component } from "solid-js";
import { createControllable } from "../../controllable";
import { renderSlot } from "../../slot";
import { RLButton } from "../button/RLButton";

const OMIT_KEYS = ["mode", "open", "defaultOpen", "triggerLabel", "onOpenChange"] as const;

export const RLPopover: Component<RLPopoverProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLPopoverTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["triggerSlot"] as const,
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );
  const [isHovered, setIsHovered] = createSignal(false);

  const mode = () => props.mode ?? "both";
  const isVisible = () => isOpen() || isHovered();

  let containerRef: HTMLElement | undefined;

  onSettled(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen() && containerRef && !containerRef.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  });

  return (
    <Tag
      ref={(el: HTMLElement) => (containerRef = el)}
      data-slot="root"
      data-theme={theme()}
      data-placement={props.placement}
      data-mode={mode()}
      class={classes().root}
      {...rest}
    >
      <div
        class={classes().trigger}
        data-slot="trigger"
        onClick={(e) => {
          e.stopPropagation();
          if (mode() === "click" || mode() === "both") setOpen(!isOpen());
        }}
        onMouseEnter={() => {
          if (mode() === "hover" || mode() === "both") setIsHovered(true);
        }}
        onMouseLeave={() => {
          if (mode() === "hover" || mode() === "both") setIsHovered(false);
        }}
      >
        <Show when={slots.triggerSlot()}>{renderSlot(slots.triggerSlot())}</Show>
        <Show when={!slots.triggerSlot() ? props.triggerLabel : undefined}>
          {(label) => <RLButton label={label()} />}
        </Show>
      </div>

      <Show when={isVisible()}>
        <div class={classes().content} data-slot="content" data-state="open">
          {children()}
        </div>
      </Show>
    </Tag>
  );
};
