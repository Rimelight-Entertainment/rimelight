import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLLogoProps } from "./logo.types";
import { RLLogoTheme } from "./logo.theme";
import { getUIConfig } from "../../runtime";
import { localizeHref } from "../link/helpers";

const OMIT_KEYS = ["variant", "mode", "src", "alt", "href"] as const;

export const RLLogo: Component<RLLogoProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLLogoTheme.setup(props, {
    as: "a",
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

  const isIcon = () => {
    const s = logoInfo().logoSrc;
    const isUrl = Boolean(s && (s.startsWith("http") || s.startsWith("/") || s.startsWith(".")));
    return Boolean(s && !isUrl && (s.includes(":") || s.startsWith("i-")));
  };

  const hasAutoMode = () => {
    const { darkSrc, lightSrc } = logoInfo();
    return Boolean(darkSrc && lightSrc && darkSrc !== lightSrc && !props.mode);
  };

  const renderContent = () => {
    const { logoSrc, darkSrc, lightSrc } = logoInfo();
    if (!logoSrc) return children();
    if (isIcon()) {
      return <span class={`${logoSrc} size-full block shrink-0`} aria-hidden="true" />;
    }
    if (hasAutoMode()) {
      return (
        <span class="rl-logo-image size-full flex items-center justify-center shrink-0">
          <img
            src={lightSrc || ""}
            alt={props.alt || ""}
            class="rl-logo-light size-full block object-contain shrink-0"
          />
          <img
            src={darkSrc || ""}
            alt={props.alt || ""}
            class="rl-logo-dark size-full hidden object-contain shrink-0"
          />
        </span>
      );
    }
    return (
      <img src={logoSrc} alt={props.alt || ""} class="size-full block object-contain shrink-0" />
    );
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      aria-label={props.alt || props.variant || "logomark"}
      href={localizeHref(props.href ?? "/")}
      {...rest}
    >
      {renderContent()}
    </Tag>
  );
};
