import type { Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { createMemo, createSignal, Show } from "solid-js";
import type { RLAvatarProps } from "./avatar.types";
import { RLAvatarTheme } from "./avatar.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLChip } from "../chip/RLChip";
import type { RLChipProps } from "../chip/chip.types";

/**
 * Extract 1-2 initials from alt text, e.g. "Benjamin Canac" -> "BC", "John" -> "J"
 */
function getInitials(alt?: string): string | undefined {
  if (!alt) return undefined;
  const parts = alt.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return undefined;
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
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

  const renderIcon = () => {
    const customIcon = slots.iconSlot();
    if (customIcon !== undefined && customIcon !== null) return customIcon;
    if (!props.icon) return null;
    return <RLIcon name={props.icon} class={classes().icon} data-slot="icon" aria-hidden="true" />;
  };

  const renderFallback = () => {
    const customSlot = slots.fallbackSlot();
    if (customSlot !== undefined && customSlot !== null) {
      return (
        <span class={classes().fallback} data-slot="fallback">
          {customSlot}
        </span>
      );
    }

    const iconContent = renderIcon();
    if (iconContent) {
      return (
        <span class={classes().fallback} data-slot="fallback">
          {iconContent}
        </span>
      );
    }

    const textVal = props.text || getInitials(props.alt);
    if (textVal) {
      return (
        <span class={classes().fallback} data-slot="fallback">
          {textVal}
        </span>
      );
    }

    return (
      <span class={classes().fallback} data-slot="fallback">
        <RLIcon name="user" class={classes().icon} data-slot="icon" aria-hidden="true" />
      </span>
    );
  };

  const avatarContent = () => {
    const customChildren = children();
    if (customChildren) return customChildren;
    if (hasImage()) {
      return (
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
      );
    }
    return renderFallback();
  };

  const chipConfig = createMemo(() => {
    const chipProp = props.chip;
    const badgeProp = props.badge || slots.badgeSlot();
    if (!chipProp && !badgeProp) return null;

    const config: Partial<RLChipProps> = {};

    if (typeof chipProp === "object" && chipProp !== null) {
      Object.assign(config, chipProp);
    } else if (chipProp === true) {
      config.inset = true;
    }

    if (badgeProp) {
      config.position = props.badgePosition ?? config.position ?? "bottom-right";
      config.inset = config.inset ?? true;
      if (props.badgeColor) config.color = props.badgeColor;
      const badgeSlot = slots.badgeSlot();
      if (badgeSlot) config.textSlot = badgeSlot;
      else if (typeof props.badge === "string" || typeof props.badge === "number") {
        config.text = props.badge;
      }
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

  return (
    <Show
      when={props.title || props.subtitle}
      fallback={
        <Chipped>
          <Tag
            data-slot="root"
            data-theme={theme()}
            class={classes().root}
            aria-label={props.title || props.alt}
            role={props.title || (!hasImage() && props.alt) ? "img" : undefined}
            {...rest}
          >
            {avatarContent()}
          </Tag>
        </Chipped>
      }
    >
      <div class={classes().wrapper} data-slot="wrapper">
        <Chipped>
          <Tag
            data-slot="root"
            data-theme={theme()}
            class={classes().root}
            aria-label={props.title || props.alt}
            role={props.title || (!hasImage() && props.alt) ? "img" : undefined}
            {...rest}
          >
            {avatarContent()}
          </Tag>
        </Chipped>
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
