import type { RLCollapsibleProps } from "./collapsible.types";
import { RLCollapsibleTheme } from "./collapsible.theme";
import { createSignal, Show, type Component } from "solid-js";
import { type JSX } from "@solidjs/web";

const OMIT_KEYS = [
  "defaultOpen",
  "unmountOnHide",
  "content",
  "contentSlot",
  "trigger",
  "triggerSlot",
  "onOpenChange",
  "id",
  "ariaLabel",
  "ariaLabelledby",
  "ariaDescribedby",
] as const;

export const RLCollapsible: Component<RLCollapsibleProps> = (props) => {
  const [internalOpen, setInternalOpen] = createSignal(props.defaultOpen ?? false);

  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : internalOpen());
  const unmountOnHide = () => props.unmountOnHide !== false;
  const isDisabled = () => props.disabled === true;

  const { Tag, classes, rest, id } = RLCollapsibleTheme.setup(props, {
    omit: OMIT_KEYS,
    idPrefix: "rl-collapsible",
    variants: () => ({ open: isOpen(), disabled: isDisabled() }),
  });

  const triggerId = () => `${id()}-trigger`;
  const contentId = () => `${id()}-content`;

  const handleToggle = () => {
    if (isDisabled()) return;
    const next = !isOpen();
    if (props.open === undefined) {
      setInternalOpen(next);
    }
    props.onOpenChange?.(next);
  };

  const hasContentProp = () => props.content !== undefined || props.contentSlot !== undefined;
  const hasTriggerProp = () => props.trigger !== undefined || props.triggerSlot !== undefined;

  const renderTrigger = () => {
    const t = props.triggerSlot ?? props.trigger;
    if (t !== undefined) {
      return typeof t === "function"
        ? (t as (p: { open: boolean }) => JSX.Element)({ open: isOpen() })
        : t;
    }
    if (hasContentProp() || !hasTriggerProp()) {
      const c = props.children;
      if (typeof c === "function") {
        return (c as (p: { open: boolean }) => JSX.Element)({ open: isOpen() });
      }
      return c;
    }
    return null;
  };

  const renderContent = () => {
    const c = props.contentSlot ?? props.content;
    if (c !== undefined) {
      return typeof c === "function" ? (c as (p?: Record<string, unknown>) => JSX.Element)({}) : c;
    }
    if (hasTriggerProp() && !hasContentProp()) {
      const ch = props.children;
      if (typeof ch === "function") {
        return (ch as (p: { open: boolean }) => JSX.Element)({ open: isOpen() });
      }
      return ch;
    }
    return null;
  };

  const hasTrigger = () => hasTriggerProp() || props.children !== undefined;
  const hasContent = () => hasContentProp() || (hasTriggerProp() && props.children !== undefined);

  return (
    <Tag
      id={props.id}
      class={classes().root}
      data-slot="root"
      data-state={isOpen() ? "open" : "closed"}
      data-disabled={isDisabled() ? "" : undefined}
      data-theme={props.theme}
      aria-label={props.ariaLabel}
      aria-labelledby={props.ariaLabelledby}
      aria-describedby={props.ariaDescribedby}
      {...rest}
    >
      <Show when={hasTrigger()}>
        <div
          id={triggerId()}
          class={classes().trigger}
          data-slot="trigger"
          aria-controls={contentId()}
          aria-expanded={isOpen() ? "true" : "false"}
          data-state={isOpen() ? "open" : "closed"}
          data-disabled={isDisabled() ? "" : undefined}
          onClick={handleToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const target = e.target as HTMLElement | null;
              if (
                target &&
                target.tagName !== "BUTTON" &&
                target.tagName !== "A" &&
                target.tagName !== "INPUT"
              ) {
                e.preventDefault();
                handleToggle();
              }
            }
          }}
        >
          {renderTrigger()}
        </div>
      </Show>

      <Show when={hasContent()}>
        <Show
          when={unmountOnHide()}
          fallback={
            <div
              id={contentId()}
              class={classes().content}
              data-slot="content"
              data-state={isOpen() ? "open" : "closed"}
              data-disabled={isDisabled() ? "" : undefined}
              hidden={!isOpen() ? true : undefined}
            >
              {renderContent()}
            </div>
          }
        >
          <Show when={isOpen()}>
            <div
              id={contentId()}
              class={classes().content}
              data-slot="content"
              data-state="open"
              data-disabled={isDisabled() ? "" : undefined}
            >
              {renderContent()}
            </div>
          </Show>
        </Show>
      </Show>
    </Tag>
  );
};
