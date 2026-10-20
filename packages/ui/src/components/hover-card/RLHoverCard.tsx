import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import type { RLHoverCardProps } from "./hover-card.types";
import { RLHoverCardTheme } from "./hover-card.theme";

const OMIT_KEYS = ["triggerLabel", "trigger"] as const;

export const RLHoverCard: Component<RLHoverCardProps> = (props) => {
  const { classes, rest } = RLHoverCardTheme.setup(props, { omit: OMIT_KEYS });

  const [isOpen, setIsOpen] = createSignal(false);

  const contentClass = () =>
    classes()["content"].replace(
      /\s*(invisible|opacity-0|scale-95|pointer-events-none|group-hover\/hover-card:(visible|opacity-100|scale-100|pointer-events-auto))/g,
      "",
    );

  return (
    <div
      class={classes().root}
      data-slot="hover-card-container"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      {...rest}
    >
      <div
        class={classes().trigger}
        data-slot="trigger"
        tabindex="0"
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
      >
        {props.trigger ? (
          props.trigger
        ) : props.triggerLabel ? (
          <span class="cursor-help underline decoration-dotted">{props.triggerLabel}</span>
        ) : null}
      </div>

      <div
        class={`${contentClass()} ${
          isOpen()
            ? "visible opacity-100 scale-100 pointer-events-auto"
            : "invisible opacity-0 scale-95 pointer-events-none"
        }`}
        data-slot="content"
      >
        {props.children}
      </div>
    </div>
  );
};
