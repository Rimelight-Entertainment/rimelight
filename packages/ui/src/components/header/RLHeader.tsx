import type { RLHeaderProps } from "./header.types";
import { RLHeaderTheme } from "./header.theme";
import {
  createComponent,
  createEffect,
  createMemo,
  createUniqueId,
  omit,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { useHeaderStack } from "./useHeaderStack";

export const RLHeader: Component<RLHeaderProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "layerType",
    "contain",
    "sticky",
    "fixed",
    "stackIndex",
    "hideOnScroll",
    "id",
    "ui",
    "class",
    "left",
    "center",
    "right",
    "children",
  );

  const contain = () => props.contain ?? true;
  const sticky = () => props.sticky ?? true;
  const fixed = () => props.fixed ?? false;
  const stackIndex = () => props.stackIndex ?? 1;
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const layerType = () => props.layerType ?? "header";
  const isBanner = () => layerType() === "banner";

  // Unique id fallback using createUniqueId so multiple headers never collide
  const layerId = typeof props["id"] === "string" ? props["id"] : `rl-header-${createUniqueId()}`;

  const resolvedClasses = createMemo(() =>
    RLHeaderTheme({
      contain: contain(),
      sticky: fixed() ? false : sticky(),
      fixed: fixed(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const { registerHeader } = useHeaderStack();
  const layer = registerHeader({
    id: layerId,
    order: stackIndex(),
    type: layerType(),
    sticky: sticky(),
    fixed: fixed(),
    hideOnScroll: hideOnScroll(),
    visible: true,
  });

  // Positioning goes through the CSSOM (not a style attribute): CSP-safe and
  // never part of the SSR markup, so no hydration mismatch.
  let rootEl: HTMLElement | undefined;
  createEffect(
    () => (fixed() || sticky() ? layer.topOffset() : undefined),
    (top) => {
      if (!rootEl) return;
      if (top === undefined) rootEl.style.removeProperty("top");
      else rootEl.style.setProperty("top", `${top}px`);
    },
  );

  const renderRoot = (content: JSX.Element) => {
    const rootProps = {
      ref: (el: HTMLElement) => {
        rootEl = el;
        layer.ref(el);
      },
      id: layerId,
      "data-slot": "root",
      class: resolvedClasses().root,
      "data-contain": contain() ? "true" : "false",
      "data-collapsed": layer.isCollapsed() ? "true" : "false",
      "data-rl-header": isBanner() ? undefined : "true",
      "data-rl-banner": isBanner() ? "true" : undefined,
      "data-stack-index": stackIndex(),
      "data-hide-on-scroll": String(hideOnScroll()),
      "data-header-layer-id": layerId,
      "data-layer-type": layerType(),
      ...rest,
    };

    if (props.as === "div") {
      return <div {...rootProps}>{content}</div>;
    }
    if (props.as === "section") {
      return <section {...rootProps}>{content}</section>;
    }
    if (props.as === "nav") {
      return <nav {...rootProps}>{content}</nav>;
    }
    if (typeof props.as === "function") {
      return createComponent(props.as as any, { ...rootProps, children: content });
    }
    return <header {...rootProps}>{content}</header>;
  };

  return renderRoot(
    <div class={resolvedClasses().content} data-header-content>
      <div class={resolvedClasses().container} data-slot="container">
        <div class={resolvedClasses().left} data-slot="left">
          {props.left}
        </div>
        <div class={resolvedClasses().center} data-slot="center">
          {props.center ?? props.children}
        </div>
        <div class={resolvedClasses().right} data-slot="right">
          {props.right}
        </div>
      </div>
    </div>,
  );
};
