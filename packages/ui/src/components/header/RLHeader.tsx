import type { RLHeaderProps } from "./header.types";
import { RLHeaderTheme } from "./header.theme";
import { createEffect, Show, type Component } from "solid-js";
import { useHeaderStack } from "./header.helpers";

const OMIT_KEYS = ["layerType", "stackIndex", "hideOnScroll"] as const;

export const RLHeader: Component<RLHeaderProps> = (props) => {
  const contain = () => props.contain ?? true;
  const sticky = () => props.sticky ?? true;
  const fixed = () => props.fixed ?? false;
  const stackIndex = () => props.stackIndex ?? 0;
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const layerType = () => props.layerType ?? "header";
  const isBanner = () => layerType() === "banner";

  const { Tag, classes, rest, id, slots, children, theme } = RLHeaderTheme.setup(props, {
    slots: ["leadingSlot", "centerSlot", "trailingSlot"] as const,
    as: "header",
    omit: OMIT_KEYS,
    variants: () => ({
      sticky: fixed() ? false : sticky(),
    }),
  });

  const { registerHeader } = useHeaderStack();
  const layer = registerHeader({
    id,
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
      id={id()}
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-contain={contain() ? "" : undefined}
      data-collapsed={layer.isCollapsed() ? "" : undefined}
      data-rl-header={isBanner() ? undefined : ""}
      data-rl-banner={isBanner() ? "" : undefined}
      data-stack-index={stackIndex()}
      data-hide-on-scroll={hideOnScroll() ? "" : undefined}
      data-header-layer-id={id()}
      data-layer-type={layerType()}
      {...rest}
    >
      <div class={classes().content} data-header-content>
        <div class={classes().container} data-slot="container">
          <div class={classes().leading} data-slot="leading">
            {slots.leadingSlot()}
          </div>
          <div class={classes().center} data-slot="center">
            <Show when={slots.centerSlot()} fallback={children()}>
              {slots.centerSlot()}
            </Show>
          </div>
          <div class={classes().trailing} data-slot="trailing">
            {slots.trailingSlot()}
          </div>
        </div>
      </div>
    </Tag>
  );
};
