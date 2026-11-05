import type { RLLinkProps } from "./link.types";
import { RLLinkTheme } from "./link.theme";
import { createMemo, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { resolveLinkAttrs } from "./link.helpers";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "label",
  "leadingIcon",
  "trailingIcon",
  "href",
  "localize",
  "external",
  "externalIcon",
  "noExternalIcon",
  "target",
  "rel",
  "noRel",
  "current",
] as const;

export const RLLink: Component<RLLinkProps> = (props) => {
  const attrs = createMemo(() => resolveLinkAttrs(props));

  const { Tag, classes, rest, slots, children, theme } = RLLinkTheme.setup(props, {
    as: "a",
    slots: ["leadingSlot", "trailingSlot"] as const,
    omit: OMIT_KEYS,
    variants: () => ({
      active: props.active,
      disabled: props.disabled,
    }),
  });

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      href={attrs().href}
      target={attrs().target}
      rel={attrs().rel}
      aria-current={attrs().ariaCurrent}
      aria-disabled={attrs().ariaDisabled}
      {...rest}
    >
      <Show
        when={slots.leadingSlot()}
        fallback={
          <Show when={props.leadingIcon}>
            {(iconName) => (
              <span class={classes().leadingIcon} data-slot="leading-icon">
                <RLIcon name={iconName()} size="sm" aria-hidden="true" />
              </span>
            )}
          </Show>
        }
      >
        {slots.leadingSlot()}
      </Show>

      <Show
        when={children()}
        fallback={
          <Show when={props.label}>
            {(label) => (
              <span class={classes().label} data-slot="label">
                {label()}
              </span>
            )}
          </Show>
        }
      >
        {children()}
      </Show>

      <Show
        when={slots.trailingSlot()}
        fallback={
          <Show when={attrs().showTrailingIcon}>
            {(iconName) => (
              <span class={classes().trailingIcon} data-slot="trailing-icon">
                <RLIcon name={iconName()} size="sm" aria-hidden="true" />
              </span>
            )}
          </Show>
        }
      >
        {slots.trailingSlot()}
      </Show>

      <Show when={attrs().isExternal && attrs().target === "_blank" && !props["aria-label"]}>
        <span class={classes().externalHint} data-slot="external-hint">
          {uiT("link.opens-in-new-tab")}
        </span>
      </Show>
    </Tag>
  );
};
