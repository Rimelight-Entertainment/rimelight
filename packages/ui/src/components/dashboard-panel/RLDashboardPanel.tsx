import type { RLDashboardPanelProps } from "./dashboard-panel.types";
import { RLDashboardPanelTheme } from "./dashboard-panel.theme";
import { createMemo, Show, omit, type Component } from "solid-js";

export const RLDashboardPanel: Component<RLDashboardPanelProps> = (props) => {
  const rest = omit(
    props,
    "resizable",
    "ui",
    "class",
    "children",
    "header",
    "headerSlot",
    "body",
    "bodySlot",
    "footer",
    "footerSlot",
    "resizeHandle",
    "resizeHandleSlot",
  );

  const resizable = () => props.resizable ?? false;

  const classes = createMemo(() =>
    RLDashboardPanelTheme({
      size: false,
      ui: props.ui,
      class: props.class,
    }),
  );

  const headerContent = () => props.header ?? props.headerSlot;
  const bodyContent = () =>
    props.body !== undefined
      ? props.body
      : props.bodySlot !== undefined
        ? props.bodySlot
        : props.children;
  const footerContent = () => props.footer ?? props.footerSlot;
  const resizeHandleContent = () => props.resizeHandle ?? props.resizeHandleSlot;

  return (
    <>
      <div class={`${classes().root} flex-1 min-w-0`} data-slot="root" {...rest}>
        {headerContent()}

        <div data-slot="body" class={classes().body}>
          {bodyContent()}
        </div>

        {footerContent()}
      </div>

      <Show when={resizable()}>
        {resizeHandleContent() !== undefined ? (
          resizeHandleContent()
        ) : (
          <div
            data-slot="handle"
            class={`${classes().handle} hidden lg:block touch-none select-none cursor-ew-resize relative before:absolute before:inset-y-0 before:-left-1.5 before:-right-1.5 before:z-1`}
          />
        )}
      </Show>
    </>
  );
};
