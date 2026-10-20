import type { RLLinkProps } from "./link.types";
import { RLLinkTheme } from "./link.theme";
import { createMemo, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { resolveLinkAttrs } from "./helpers";

const OMIT_KEYS = [
  "label",
  "leadingIcon",
  "trailingIcon",
  "href",
  "external",
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

  const ariaLabelValue = () => props.ariaLabel;

  const { classes: themeClasses, rest } = RLLinkTheme.setup(props, {
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
      {props.leading ? (
        props.leading
      ) : props.leadingIcon ? (
        <span class={classes()["leadingIcon"]} data-slot="leading-icon">
          <RLIcon name={props.leadingIcon} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {props.children !== undefined && props.children !== null ? (
        props.children
      ) : props.label !== undefined && props.label !== null ? (
        <span class={classes()["label"]} data-slot="label">
          {props.label}
        </span>
      ) : null}

      {props.trailing ? (
        props.trailing
      ) : attrs().showTrailingIcon ? (
        <span class={classes()["trailingIcon"]} data-slot="trailing-icon">
          <RLIcon name={attrs().showTrailingIcon!} size="sm" aria-hidden="true" />
        </span>
      ) : null}

      {attrs().isExternal && attrs().target === "_blank" && !ariaLabelValue() && (
        <span class={classes()["externalHint"]} data-slot="external-hint">
          (opens in a new tab)
        </span>
      )}
    </a>
  );
};
