import type { RLHeaderProps } from "./header.types";
import { RLHeaderTheme } from "./header.theme";
import { createEffect, createMemo, createUniqueId, omit, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import { useHeaderStack } from "./useHeaderStack";

export const RLHeader: Component<RLHeaderProps> = (props) => {
  const rest = omit(
    props,
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

  const fallbackId = `rl-header-${createUniqueId()}`;
  const layerId = () => (typeof props["id"] === "string" ? props["id"] : fallbackId);

  const Tag = dynamic(() => props.as ?? "header");

  const contain = () => props.contain ?? true;
  const sticky = () => props.sticky ?? true;
  const fixed = () => props.fixed ?? false;
  const stackIndex = () => props.stackIndex ?? 1;
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const layerType = () => props.layerType ?? "header";
  const isBanner = () => layerType() === "banner";

  const classes = createMemo(() =>
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
    order: stackIndex,
    type: layerType,
    sticky: sticky,
    fixed: fixed,
    hideOnScroll: hideOnScroll,
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

  return (
    <Tag
      ref={(el: HTMLElement) => {
        rootEl = el;
        layer.ref(el);
      }}
      id={layerId()}
      data-slot="root"
      class={classes().root}
      data-contain={contain() ? "true" : "false"}
      data-collapsed={layer.isCollapsed() ? "true" : "false"}
      data-rl-header={isBanner() ? undefined : "true"}
      data-rl-banner={isBanner() ? "true" : undefined}
      data-stack-index={stackIndex()}
      data-hide-on-scroll={String(hideOnScroll())}
      data-header-layer-id={layerId()}
      data-layer-type={layerType()}
      {...rest}
    >
      <div class={classes().content} data-header-content>
        <div class={classes().container} data-slot="container">
          <div class={classes().left} data-slot="left">
            {props.left}
          </div>
          <div class={classes().center} data-slot="center">
            {props.center ?? props.children}
          </div>
          <div class={classes().right} data-slot="right">
            {props.right}
          </div>
        </div>
      </div>
    </Tag>
  );
};
