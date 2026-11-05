import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, Show } from "solid-js";
import type { RLAvatarProps } from "./avatar.types";
import { RLAvatarTheme } from "./avatar.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLChip } from "../chip/RLChip";
import type { RLChipProps } from "../chip/chip.types";
import { renderSlot } from "../../slot";

/**
 * Extract 1-2 initials from alt text, e.g. "Benjamin Canac" -> "BC", "John" -> "J"
 */
function getInitials(alt?: string): string | undefined {
  if (!alt) return undefined;
  const parts = alt.trim().split(/\s+/).filter(Boolean);
  const first = parts[0];
  if (first === undefined) return undefined;
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  const last = parts[parts.length - 1] ?? first;
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

const OMIT_KEYS = [
  "src",
  "alt",
  "icon",
  "text",
  "title",
  "subtitle",
  "chip",
  "badge",
  "badgeColor",
  "position",
  "loading",
  "referrerpolicy",
  "crossorigin",
  "decoding",
  "height",
  "width",
  "sizes",
  "srcset",
  "usemap",
  "imgProps",
] as const;

export const RLAvatar: Component<RLAvatarProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLAvatarTheme.setup(props, {
    as: "span",
    omit: OMIT_KEYS,
    slots: ["iconSlot", "fallbackSlot", "badgeSlot"] as const,
  });

  const [imageError, setImageError] = createSignal(false);

  const hasImage = () => Boolean(props.src && !imageError());
  const fallbackText = () => props.text || getInitials(props.alt);

  const renderIcon = () => (
    <Show
      when={slots.iconSlot()}
      fallback={
        <Show when={props.icon}>
          {(icon) => (
            <RLIcon name={icon()} class={classes().icon} data-slot="icon" aria-hidden="true" />
          )}
        </Show>
      }
    >
      {renderSlot(slots.iconSlot())}
    </Show>
  );

  const renderFallback = () => (
    <span class={classes().fallback} data-slot="fallback">
      <Show
        when={slots.fallbackSlot()}
        fallback={
          <Show
            when={slots.iconSlot() || props.icon}
            fallback={
              <Show
                when={fallbackText()}
                fallback={
                  <RLIcon name="user" class={classes().icon} data-slot="icon" aria-hidden="true" />
                }
              >
                {fallbackText()}
              </Show>
            }
          >
            {renderIcon()}
          </Show>
        }
      >
        {renderSlot(slots.fallbackSlot())}
      </Show>
    </span>
  );

  const renderBadge = () => (
    <span class={classes().badge} data-slot="badge">
      <Show when={slots.badgeSlot()} fallback={props.badge}>
        {renderSlot(slots.badgeSlot())}
      </Show>
    </span>
  );

  const chipConfig = createMemo(() => {
    const chipProp = props.chip;
    const hasBadge = Boolean(props.badge || slots.badgeSlot());
    if (!chipProp && !hasBadge) return null;

    const config: Partial<RLChipProps> = {};

    if (typeof chipProp === "object" && chipProp !== null) {
      Object.assign(config, chipProp);
    } else if (chipProp === true) {
      config.inset = true;
    }

    if (hasBadge) {
      config.position = props.position ?? config.position ?? "bottom-right";
      config.inset = config.inset ?? true;
      if (props.badgeColor) config.color = props.badgeColor;
      config.labelSlot = renderBadge;
    }

    return config;
  });

  const Chipped = (chipProps: { children: JSX.Element }) => (
    <Show when={chipConfig()} fallback={chipProps.children}>
      {(cfg) => (
        <RLChip size={props.size} {...cfg()}>
          {chipProps.children}
        </RLChip>
      )}
    </Show>
  );

  const Root = (rootArgs: { theme: RLAvatarProps["theme"] }) => (
    <Chipped>
      <Tag
        data-slot="root"
        data-theme={rootArgs.theme}
        class={classes().root}
        aria-label={props.title || props.alt}
        role={props.title || (!hasImage() && props.alt) ? "img" : undefined}
        {...rest}
      >
        <Show
          when={children()}
          fallback={
            <Show when={hasImage()} fallback={renderFallback()}>
              <img
                src={props.src}
                alt={props.alt ?? ""}
                class={classes().image}
                data-slot="image"
                loading={props.loading}
                referrerpolicy={props.referrerpolicy || undefined}
                crossorigin={props.crossorigin || undefined}
                decoding={props.decoding}
                height={props.height}
                width={props.width}
                sizes={props.sizes}
                srcset={props.srcset}
                usemap={props.usemap}
                onError={() => setImageError(true)}
                {...props.imgProps}
              />
            </Show>
          }
        >
          {children()}
        </Show>
      </Tag>
    </Chipped>
  );

  return (
    <Show when={props.title || props.subtitle} fallback={<Root theme={theme()} />}>
      <div class={classes().wrapper} data-slot="wrapper">
        <Root theme={theme()} />
        <div class={classes().text} data-slot="text">
          <Show when={props.title}>
            <span class={classes().title} data-slot="title">
              {props.title}
            </span>
          </Show>
          <Show when={props.subtitle}>
            <span class={classes().subtitle} data-slot="subtitle">
              {props.subtitle}
            </span>
          </Show>
        </div>
      </div>
    </Show>
  );
};
