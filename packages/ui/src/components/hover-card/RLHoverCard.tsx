import type { RLHoverCardProps } from "./hover-card.types";
import { RLHoverCardTheme } from "./hover-card.theme";
import { createMemo, createSignal, omit, type Component } from "solid-js";

export const RLHoverCard: Component<RLHoverCardProps> = (props) => {
  const rest = omit(props, "triggerLabel", "placement", "ui", "class", "children", "trigger");

  const [isOpen, setIsOpen] = createSignal(false);

  const classes = createMemo(() =>
    RLHoverCardTheme({
      placement: props.placement ?? "bottom",
      ui: props.ui,
      class: props.class,
    }),
  );

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
