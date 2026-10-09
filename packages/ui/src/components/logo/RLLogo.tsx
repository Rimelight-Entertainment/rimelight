import type { RLLogoProps } from "./logo.types";
import { RLLogoTheme } from "./logo.theme";
import { createMemo, omit, type Component } from "solid-js";
import uiConfig from "#rimelight/ui";

export const RLLogo: Component<RLLogoProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "variant",
    "mode",
    "theme",
    "href",
    "alt",
    "src",
    "ui",
    "class",
    "children",
    "icon",
    "text",
    "fallback",
    "initials",
    "size",
    "color",
    "chip",
    "badge",
    "badgeColor",
    "badgePosition",
    "loading",
    "referrerpolicy",
    "crossorigin",
    "decoding",
    "height",
    "width",
    "sizes",
    "srcset",
    "usemap",
    "title",
    "subtitle",
    "label",
  );

  const variant = () => props.variant || "logomark";
  const href = () => props.href ?? "/";

  const logoInfo = createMemo(() => {
    if (props.src) {
      return { logoSrc: props.src, darkSrc: null, lightSrc: null };
    }

    const cfgLogos = (uiConfig as any)?.logos;
    const logoVariant = cfgLogos?.[variant()];

    let logoSrc: string | null = null;
    let darkSrc: string | null = null;
    let lightSrc: string | null = null;

    if (logoVariant && typeof logoVariant === "object") {
      if (props.mode) {
        logoSrc = logoVariant[props.mode] || logoVariant.color;
      } else {
        logoSrc = logoVariant.color || logoVariant.black || logoVariant.white;
        darkSrc = logoVariant.white || logoVariant.color;
        lightSrc = logoVariant.black || logoVariant.color;
      }
    } else if (typeof logoVariant === "string") {
      logoSrc = logoVariant;
    }

    return { logoSrc, darkSrc, lightSrc };
  });

  const startsWithUrlPrefix = () => {
    const s = logoInfo().logoSrc;
    return Boolean(s && (s.startsWith("http") || s.startsWith("/") || s.startsWith(".")));
  };

  const isIcon = () => {
    const s = logoInfo().logoSrc;
    return Boolean(s && !startsWithUrlPrefix() && (s.includes(":") || s.startsWith("i-")));
  };

  const hasAutoMode = () => {
    const { darkSrc, lightSrc } = logoInfo();
    return Boolean(darkSrc && lightSrc && darkSrc !== lightSrc && !props.mode);
  };

  const resolvedClasses = createMemo(() =>
    RLLogoTheme({
      variant: variant(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const renderContent = () => {
    const { logoSrc, darkSrc, lightSrc } = logoInfo();
    if (!logoSrc) return props.children;
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
    <a
      class={resolvedClasses().root}
      href={href()}
      aria-label={props.alt || variant()}
      data-slot="root"
      data-theme={props.theme}
      {...rest}
    >
      {renderContent()}
    </a>
  );
};
