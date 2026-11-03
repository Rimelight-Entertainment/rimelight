import type { RLLinkProps } from "./link.types";
import { RLLinkTheme } from "./link.theme";
import { createMemo, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { resolveLinkAttrs } from "./helpers";
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
      {slots.leadingSlot() ? (
        slots.leadingSlot()
      ) : props.leadingIcon ? (
        <span class={classes().leadingIcon} data-slot="leading-icon">
          <RLIcon name={props.leadingIcon} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {children() ??
        (props.label !== undefined && props.label !== null ? (
          <span class={classes().label} data-slot="label">
            {props.label}
          </span>
        ) : null)}

      {slots.trailingSlot() ? (
        slots.trailingSlot()
      ) : (
        <Show when={attrs().showTrailingIcon}>
          {(iconName) => (
            <span class={classes().trailingIcon} data-slot="trailing-icon">
              <RLIcon name={iconName()} size="sm" aria-hidden="true" />
            </span>
          )}
        </Show>
      )}

      {attrs().isExternal && attrs().target === "_blank" && !props["aria-label"] && (
        <span class={classes().externalHint} data-slot="external-hint">
          {uiT("link.opens-in-new-tab")}
        </span>
      )}
    </Tag>
  );
};
