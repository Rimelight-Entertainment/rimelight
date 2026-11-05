import type { Component } from "solid-js";
import { createMemo, Match, Show, Switch } from "solid-js";
import type { RLLogoProps } from "./logo.types";
import { RLLogoTheme } from "./logo.theme";
import { RLLink } from "../link/RLLink";
import { RLIcon } from "../icon/RLIcon";
import { getUIConfig } from "../../runtime";

const OMIT_KEYS = ["variant", "mode", "src", "alt", "href", "aria-label"] as const;

export const RLLogo: Component<RLLogoProps> = (props) => {
  const { classes, rest, children, theme, tagProp } = RLLogoTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const logoInfo = createMemo(() => {
    if (props.src) {
      return { logoSrc: props.src, darkSrc: null, lightSrc: null };
    }

    const cfgLogos = getUIConfig()?.logos;
    const logoVariant = cfgLogos?.[props.variant || "logomark"];

    let logoSrc: string | null = null;
    let darkSrc: string | null = null;
    let lightSrc: string | null = null;

    if (logoVariant && typeof logoVariant === "object") {
      const v = logoVariant as Record<string, string | undefined>;
      const color = v["color"] ?? null;
      const black = v["black"] ?? null;
      const white = v["white"] ?? null;
      if (props.mode) {
        logoSrc = v[props.mode] || color;
      } else {
        logoSrc = color || black || white;
        darkSrc = white || color;
        lightSrc = black || color;
      }
    } else if (typeof logoVariant === "string") {
      logoSrc = logoVariant;
    }

    return { logoSrc, darkSrc, lightSrc };
  });

  const kind = createMemo(() => {
    const { logoSrc, darkSrc, lightSrc } = logoInfo();
    if (!logoSrc) return "children";
    const isUrl = logoSrc.startsWith("http") || logoSrc.startsWith("/") || logoSrc.startsWith(".");
    if (!isUrl && (logoSrc.includes(":") || logoSrc.startsWith("i-"))) return "icon";
    if (darkSrc && lightSrc && darkSrc !== lightSrc && !props.mode) return "auto";
    return "image";
  });

  return (
    <RLLink
      as={tagProp()}
      href={props.href ?? "/"}
      localize
      aria-label={props["aria-label"] || props.alt || props.variant || "logomark"}
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      {...rest}
    >
      <Switch>
        <Match when={kind() === "icon"}>
          <RLIcon name={logoInfo().logoSrc ?? ""} class={classes().icon} data-slot="icon" />
        </Match>
        <Match when={kind() === "auto"}>
          <img
            src={logoInfo().lightSrc ?? ""}
            alt={props.alt || ""}
            class={classes().lightImage}
            data-slot="light-image"
          />
          <img
            src={logoInfo().darkSrc ?? ""}
            alt={props.alt || ""}
            class={classes().darkImage}
            data-slot="dark-image"
          />
        </Match>
        <Match when={kind() === "image"}>
          <img
            src={logoInfo().logoSrc ?? ""}
            alt={props.alt || ""}
            class={classes().image}
            data-slot="image"
          />
        </Match>
        <Match when={kind() === "children"}>
          <Show when={children()}>{children()}</Show>
        </Match>
      </Switch>
    </RLLink>
  );
};
