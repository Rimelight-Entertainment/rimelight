import { createEffect, createMemo, createSignal, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { CollapsibleProps } from "./collapsible";
import { collapsibleTheme } from "./collapsible.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLCollapsibleProps extends CollapsibleProps {
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const RLCollapsible: Component<RLCollapsibleProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "open",
    "defaultOpen",
    "label",
    "icon",
    "size",
    "color",
    "ui",
    "class",
    "children",
    "triggerSlot",
    "onOpenChange",
  );

  const [isOpen, setIsOpen] = createSignal(props.open ?? props.defaultOpen ?? false);

  createEffect(
    () => props.open,
    (open) => {
      if (open !== undefined) setIsOpen(open);
    },
  );

  const resolvedClasses = createMemo(() =>
    collapsibleTheme({
      open: isOpen(),
      size: props.size,
      color: props.color,
      ui: props.ui,
      class: props.class,
    }),
  );

  const handleToggle = (e: Event) => {
    const target = e.currentTarget as HTMLDetailsElement;
    setIsOpen(target.open);
    props.onOpenChange?.(target.open);
  };

  return (
    <details
      class={resolvedClasses().root}
      open={isOpen()}
      onToggle={handleToggle}
      data-slot="root"
      {...rest}
    >
      <summary class={resolvedClasses().trigger} data-slot="trigger">
        {props.triggerSlot ? (
          props.triggerSlot
        ) : (
          <>
            <span class="flex items-center gap-2">
              {props.icon ? <span class={props.icon} aria-hidden="true" /> : null}
              {props.label ?? "Toggle"}
            </span>
            <RLIcon
              name="chevronDown"
              size="sm"
              class={`transition-transform duration-200 ${isOpen() ? "rotate-180" : ""}`}
            />
          </>
        )}
      </summary>
      <div class={resolvedClasses().content} data-slot="content">
        {props.children}
      </div>
    </details>
  );
};
