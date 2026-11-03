import type { RLLinkProps } from "./link.types";
import { RLLinkTheme } from "./link.theme";
import { children, createMemo, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { resolveLinkAttrs } from "./helpers";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "label",
  "leadingIcon",
  "trailingIcon",
  "href",
  "external",
  "localize",
  "externalIcon",
  "noExternalIcon",
  "target",
  "rel",
  "ariaLabel",
  "ariaCurrentValue",
  "raw",
  "leading",
  "trailing",
] as const;

export const RLLink: Component<RLLinkProps> = (props) => {
  const attrs = createMemo(() => resolveLinkAttrs(props));

  const resolvedLeading = children(() => slots.leadingSlot());
  const resolvedChildren = children(() => props.children);
  const resolvedTrailing = children(() => slots.trailingSlot());

  const ariaLabelValue = () => props.ariaLabel;

  const {
    classes: themeClasses,
    rest,
    slots,
  } = RLLinkTheme.setup(props, {
    slots: ["leadingSlot", "trailingSlot"] as const,
    omit: OMIT_KEYS,
    variants: () => ({
      active: props.active,
      disabled: !!props.disabled,
    }),
  });

  const classes = createMemo<Record<string, string>>(() => {
    if (props.raw) {
      return { root: props.class || "", externalHint: "sr-only" };
    }

    return themeClasses();
  });

  return (
    <a
      class={classes()["root"]}
      data-slot="root"
      data-theme={props.theme}
      href={attrs().href}
      target={attrs().target}
      rel={attrs().rel}
      aria-label={ariaLabelValue()}
      aria-current={attrs().ariaCurrent}
      aria-disabled={attrs().ariaDisabled}
      {...rest}
    >
      {resolvedLeading() ? (
        resolvedLeading()
      ) : props.leadingIcon ? (
        <span class={classes()["leadingIcon"]} data-slot="leading-icon">
          <RLIcon name={props.leadingIcon} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {resolvedChildren() ??
        (props.label !== undefined && props.label !== null ? (
          <span class={classes()["label"]} data-slot="label">
            {props.label}
          </span>
        ) : null)}

      {resolvedTrailing() ? (
        resolvedTrailing()
      ) : attrs().showTrailingIcon ? (
        <span class={classes()["trailingIcon"]} data-slot="trailing-icon">
          <RLIcon name={attrs().showTrailingIcon!} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {attrs().isExternal && attrs().target === "_blank" && !ariaLabelValue() && (
        <span class={classes()["externalHint"]} data-slot="external-hint">
          {uiT("link.opens-in-new-tab")}
        </span>
      )}
    </a>
  );
};
