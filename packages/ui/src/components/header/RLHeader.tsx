import type { RLHeaderProps } from "./header.types";
import { RLHeaderTheme } from "./header.theme";
import { createEffect, type Component } from "solid-js";
import { useHeaderStack } from "./useHeaderStack";

const OMIT_KEYS = [
  "layerType",
  "contain",
  "sticky",
  "fixed",
  "stackIndex",
  "hideOnScroll",
  "left",
  "center",
  "right",
] as const;

export const RLHeader: Component<RLHeaderProps> = (props) => {
  const contain = () => props.contain ?? true;
  const sticky = () => props.sticky ?? true;
  const fixed = () => props.fixed ?? false;
  const stackIndex = () => props.stackIndex ?? 0;
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const layerType = () => props.layerType ?? "header";
  const isBanner = () => layerType() === "banner";

  const { Tag, classes, rest, id, slots } = RLHeaderTheme.setup(props, {
    slots: ["leftSlot", "centerSlot", "rightSlot"] as const,
    as: "header",
    omit: OMIT_KEYS,
    variants: () => ({
      contain: contain(),
      sticky: fixed() ? false : sticky(),
      fixed: fixed(),
    }),
  });

  const layerId = id;

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
            {slots.leftSlot()}
          </div>
          <div class={classes().center} data-slot="center">
            {slots.centerSlot() ?? props.children}
          </div>
          <div class={classes().right} data-slot="right">
            {slots.rightSlot()}
          </div>
        </div>
      </div>
    </Tag>
  );
};
