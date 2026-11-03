import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLBrowserMockupProps } from "./browser-mockup.types";
import { RLBrowserMockupTheme } from "./browser-mockup.theme";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const OMIT_KEYS = ["url", "urlPrefix", "urlIcon", "controls", "navigation"] as const;

export const RLBrowserMockup: Component<RLBrowserMockupProps> = (props) => {
  const { Tag, classes, rest, id, slots, children, theme } = RLBrowserMockupTheme.setup(props, {
    slots: [
      "headerSlot",
      "controlsSlot",
      "navigationSlot",
      "urlPrefixSlot",
      "urlSlot",
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

  const titleId = id;

  const showControls = () => props.controls !== false && props.controlsVariant !== "none";

  const showNavigation = () => Boolean(props.navigation);

  const showUrlBar = () =>
    props.url !== undefined ||
    Boolean(slots.urlSlot()) ||
    Boolean(slots.urlPrefixSlot()) ||
    Boolean(slots.urlSuffixSlot());

  const urlIconName = () => props.urlIcon ?? "lock";

  const renderUrlPrefix = () => {
    if (slots.urlPrefixSlot()) {
      return slots.urlPrefixSlot();
    }
    if (props.urlPrefix === false) {
      return null;
    }
    if (typeof props.urlPrefix === "string") {
      return (
        <span class={classes().urlPrefix} data-slot="url-prefix">
          {props.urlPrefix}
        </span>
      );
    }
    return (
      <span class={classes().urlPrefix} data-slot="url-prefix">
        <RLIcon name={urlIconName()} class={classes().urlIcon} aria-hidden="true" />
      </span>
    );
  };

  return (
    <Tag
      role="region"
      aria-label={
        props.url !== undefined
          ? `${uiT("browser-mockup.labelWithUrl")} ${props.url}`
          : uiT("browser-mockup.label")
      }
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      {...rest}
    >
      <header class={classes().header} data-slot="header">
        <Show
          when={slots.headerSlot()}
          fallback={
            <>
              {/* Window Controls (macOS / neutral dots) */}
              <Show when={showControls()}>
                <Show
                  when={slots.controlsSlot()}
                  fallback={
                    <div class={classes().controls} data-slot="controls" aria-hidden="true">
                      <span
                        class={`${classes().dot} ${classes().dotClose}`}
                        data-slot="dot-close"
                      />
                      <span
                        class={`${classes().dot} ${classes().dotMinimize}`}
                        data-slot="dot-minimize"
                      />
                      <span
                        class={`${classes().dot} ${classes().dotMaximize}`}
                        data-slot="dot-maximize"
                      />
                    </div>
                  }
                >
                  {slots.controlsSlot()}
                </Show>
              </Show>

              {/* Navigation controls (back, forward, reload) */}
              <Show when={showNavigation()}>
                <Show
                  when={slots.navigationSlot()}
                  fallback={
                    <div
                      class={classes().navigation}
                      data-slot="navigation"
                      aria-label={uiT("browser.navigation")}
                    >
                      <button
                        type="button"
                        aria-label={uiT("browser.back")}
                        class={`${classes().navButton} ${classes().navBack}`}
                        data-slot="nav-back"
                      >
                        <RLIcon name="arrow-left" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={uiT("browser.forward")}
                        class={`${classes().navButton} ${classes().navForward}`}
                        data-slot="nav-forward"
                      >
                        <RLIcon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label={uiT("browser.reload")}
                        class={`${classes().navButton} ${classes().navReload}`}
                        data-slot="nav-reload"
                      >
                        <RLIcon name="rotate-cw" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  }
                >
                  {slots.navigationSlot()}
                </Show>
              </Show>

              {/* URL Address Bar */}
              <Show when={showUrlBar()}>
                <Show
                  when={slots.urlSlot()}
                  fallback={
                    <div class={classes().urlBar} data-slot="url-bar">
                      {renderUrlPrefix()}
                      <Show when={props.url}>
                        <span id={titleId()} class={classes().urlText} data-slot="url-text">
                          {props.url}
                        </span>
                      </Show>
                      <Show when={slots.urlSuffixSlot()}>
                        <span class={classes().urlSuffix} data-slot="url-suffix">
                          {slots.urlSuffixSlot()}
                        </span>
                      </Show>
                    </div>
                  }
                >
                  {slots.urlSlot()}
                </Show>
              </Show>

              {/* Actions slot */}
              <Show when={slots.actionsSlot()}>
                <div class={classes().actions} data-slot="actions">
                  {slots.actionsSlot()}
                </div>
              </Show>
            </>
          }
        >
          {slots.headerSlot()}
        </Show>
      </header>

      {/* Mockup Body Content */}
      <div class={classes().body} data-slot="body">
        {children()}
      </div>
    </Tag>
  );
};
