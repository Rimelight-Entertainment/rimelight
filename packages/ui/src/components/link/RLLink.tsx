import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { LinkProps } from "./link";
import { linkTheme } from "./link.theme";
import { RLIcon } from "../icon/RLIcon";
import { resolveLinkAttrs } from "./helpers";

export interface RLLinkProps extends LinkProps {
  children?: JSX.Element;
  leading?: JSX.Element;
  trailing?: JSX.Element;
}

const RLLink: Component<RLLinkProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "label",
    "leadingIcon",
    "trailingIcon",
    "href",
    "external",
    "externalIcon",
    "noExternalIcon",
    "target",
    "rel",
    "prefetch",
    "active",
    "disabled",
    "raw",
    "ariaLabel",
    "ariaCurrentValue",
    "theme",
    "ui",
    "class",
    "children",
    "leading",
    "trailing",
  );

  const attrs = createMemo(() => resolveLinkAttrs(props));

  const ariaLabelValue = () => props.ariaLabel ?? (props["aria-label"] as string | undefined);

  const classes = createMemo<Record<string, string>>(() => {
    if (props.raw) {
      return { root: props.class || "", externalHint: "sr-only" };
    }

    return linkTheme({
      theme: props.theme,
      ...(props.active !== undefined ? { active: props.active } : {}),
      disabled: !!props.disabled,
      ui: props.ui,
      class: props.class,
    });
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
      data-astro-prefetch={attrs().prefetchAttr}
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

export { RLLink };
