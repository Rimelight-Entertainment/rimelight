import type { RLCollapsibleProps } from "./collapsible.types";
import { RLCollapsibleTheme } from "./collapsible.theme";
import { createMemo, createSignal, createUniqueId, omit, Show, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";

export const RLCollapsible: Component<RLCollapsibleProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "ui",
    "class",
    "disabled",
    "defaultOpen",
    "open",
    "unmountOnHide",
    "children",
    "content",
    "contentSlot",
    "trigger",
    "triggerSlot",
    "onOpenChange",
    "id",
    "theme",
    "ariaLabel",
    "ariaLabelledby",
    "ariaDescribedby",
  );

  const [internalOpen, setInternalOpen] = createSignal(props.defaultOpen ?? false);

  const isOpen = () => (props.open !== undefined ? Boolean(props.open) : internalOpen());
  const unmountOnHide = () => props.unmountOnHide !== false;
  const isDisabled = () => props.disabled === true;

  const fallbackId = createUniqueId();
  const instanceId = () => props.id || `rl-collapsible-${fallbackId}`;
  const triggerId = () => `${instanceId()}-trigger`;
  const contentId = () => `${instanceId()}-content`;

  const handleToggle = () => {
    if (isDisabled()) return;
    const next = !isOpen();
    if (props.open === undefined) {
      setInternalOpen(next);
    }
    props.onOpenChange?.(next);
  };

  const resolvedClasses = createMemo(() =>
    RLCollapsibleTheme({
      open: isOpen(),
      disabled: isDisabled(),
      ui: props.ui,
      class: props.class,
    }),
  );

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

  const Tag = dynamic(() => props.as ?? "div");

  const hasTrigger = () => hasTriggerProp() || props.children !== undefined;
  const hasContent = () => hasContentProp() || (hasTriggerProp() && props.children !== undefined);

  return (
    <Tag
      id={props.id}
      class={resolvedClasses().root}
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
          class={resolvedClasses().trigger}
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
              class={resolvedClasses().content}
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
              class={resolvedClasses().content}
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
