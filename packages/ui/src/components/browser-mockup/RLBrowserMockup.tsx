import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLBrowserMockupProps } from "./browser-mockup.types";
import { RLBrowserMockupTheme } from "./browser-mockup.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { renderSlot } from "../../slot";
import { uiT } from "../../locale";

const OMIT_KEYS = ["url", "urlPrefix", "urlIcon", "controls", "navigation"] as const;

export const RLBrowserMockup: Component<RLBrowserMockupProps> = (props) => {
  const { Tag, classes, rest, id, slots, children, theme } = RLBrowserMockupTheme.setup(props, {
    slots: [
      "headerSlot",
      "controlsSlot",
      "navigationSlot",
      "urlBarSlot",
      "urlPrefixSlot",
      "urlSuffixSlot",
      "actionsSlot",
    ] as const,
    omit: OMIT_KEYS,
    variants: () => ({
      controlsVariant: props.controls === false ? "none" : props.controlsVariant,
      padded: props.padded,
      shadow: props.shadow,
      rounded: props.rounded,
    }),
  });

  const showControls = () => props.controls !== false && props.controlsVariant !== "none";

  const showNavigation = () => Boolean(props.navigation);

  const showUrlPrefix = () => props.urlPrefix !== false || Boolean(slots.urlPrefixSlot());

  const showUrlBar = () =>
    props.url !== undefined ||
    Boolean(slots.urlBarSlot()) ||
    Boolean(slots.urlPrefixSlot()) ||
    Boolean(slots.urlSuffixSlot());

  const urlIconName = () => props.urlIcon ?? "lock";

  const renderControls = () => (
    <Show
      when={slots.controlsSlot()}
      fallback={
        <div class={classes().controls} data-slot="controls" aria-hidden="true">
          <span class={classes().dotClose} data-slot="dot-close" />
          <span class={classes().dotMinimize} data-slot="dot-minimize" />
          <span class={classes().dotMaximize} data-slot="dot-maximize" />
        </div>
      }
    >
      {(node) => renderSlot(node())}
    </Show>
  );

  const renderNavigation = () => (
    <Show
      when={slots.navigationSlot()}
      fallback={
        <div
          class={classes().navigation}
          data-slot="navigation"
          aria-label={uiT("browser.navigation")}
        >
          <RLButton
            data-slot="back"
            class={classes().navButton}
            variant="ghost"
            color="neutral"
            size="xs"
            shape="square"
            leadingIcon="arrow-left"
            aria-label={uiT("browser.back")}
          />
          <RLButton
            data-slot="forward"
            class={classes().navButton}
            variant="ghost"
            color="neutral"
            size="xs"
            shape="square"
            leadingIcon="arrow-right"
            aria-label={uiT("browser.forward")}
          />
          <RLButton
            data-slot="reload"
            class={classes().navButton}
            variant="ghost"
            color="neutral"
            size="xs"
            shape="square"
            leadingIcon="rotate-cw"
            aria-label={uiT("browser.reload")}
          />
        </div>
      }
    >
      {(node) => renderSlot(node())}
    </Show>
  );

  const renderUrlPrefixDefault = () => (
    <Show
      when={typeof props.urlPrefix === "string"}
      fallback={
        <RLIcon
          name={urlIconName()}
          class={classes().urlIcon}
          data-slot="url-icon"
          aria-hidden="true"
        />
      }
    >
      {props.urlPrefix}
    </Show>
  );

  const renderUrlPrefix = () => (
    <span class={classes().urlPrefix} data-slot="url-prefix">
      <Show when={slots.urlPrefixSlot()} fallback={renderUrlPrefixDefault()}>
        {(node) => renderSlot(node())}
      </Show>
    </span>
  );

  const renderUrlBar = () => (
    <Show
      when={slots.urlBarSlot()}
      fallback={
        <div class={classes().urlBar} data-slot="url-bar">
          <Show when={showUrlPrefix()}>{renderUrlPrefix()}</Show>
          <Show when={props.url}>
            <span id={id()} class={classes().urlText} data-slot="url-text">
              {props.url}
            </span>
          </Show>
          <Show when={slots.urlSuffixSlot()}>
            {(node) => (
              <span class={classes().urlSuffix} data-slot="url-suffix">
                {renderSlot(node())}
              </span>
            )}
          </Show>
        </div>
      }
    >
      {(node) => renderSlot(node())}
    </Show>
  );

  const renderHeaderContent = () => (
    <>
      <Show when={showControls()}>{renderControls()}</Show>
      <Show when={showNavigation()}>{renderNavigation()}</Show>
      <Show when={showUrlBar()}>{renderUrlBar()}</Show>
      <Show when={slots.actionsSlot()}>
        {(node) => (
          <div class={classes().actions} data-slot="actions">
            {renderSlot(node())}
          </div>
        )}
      </Show>
    </>
  );

  return (
    <Tag
      role="region"
      aria-label={
        props.url ? uiT("browser-mockup.labelWithUrl") + props.url : uiT("browser-mockup.label")
      }
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      {...rest}
    >
      <header class={classes().header} data-slot="header">
        <Show when={slots.headerSlot()} fallback={renderHeaderContent()}>
          {(node) => renderSlot(node())}
        </Show>
      </header>
      <div class={classes().body} data-slot="body">
        {children()}
      </div>
    </Tag>
  );
};
