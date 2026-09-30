import { createMemo, createSignal, omit, Show, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";
import type { AvatarProps } from "./avatar";
import { avatarTheme } from "./avatar.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLChip } from "../chip/RLChip";

export interface RLAvatarProps extends AvatarProps {
  children?: JSX.Element;
  fallbackSlot?: JSX.Element;
  badgeSlot?: JSX.Element;
  imgProps?: JSX.ImgHTMLAttributes<HTMLImageElement>;
}

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

const RLAvatar: Component<RLAvatarProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "src",
    "alt",
    "icon",
    "text",
    "fallback",
    "initials",
    "title",
    "subtitle",
    "label",
    "chip",
    "badge",
    "badgeColor",
    "badgePosition",
    "size",
    "color",
    "loading",
    "referrerpolicy",
    "crossorigin",
    "decoding",
    "height",
    "width",
    "sizes",
    "srcset",
    "usemap",
    "ui",
    "class",
    "children",
    "fallbackSlot",
    "badgeSlot",
    "imgProps",
  );

  const [imageError, setImageError] = createSignal(false);

  const resolvedClasses = createMemo(() =>
    avatarTheme({
      size: props.size ?? "md",
      color: props.color ?? "neutral",
      badgePosition: props.badgePosition ?? "bottom-right",
      ui: props.ui,
      class: props.class,
    }),
  );

  const fallbackText = () =>
    props.text || props.fallback || props.initials || getInitials(props.alt);

  const hasImage = () => Boolean(props.src && !imageError());

  const Root = dynamic(() => props.as ?? "span");

  const renderIcon = () => {
    if (!props.icon) return null;
    if (typeof props.icon === "string") {
      return (
        <RLIcon
          name={props.icon}
          class={resolvedClasses().icon}
          ui={{ root: resolvedClasses().icon }}
          aria-hidden="true"
        />
      );
    }
    return <span class={resolvedClasses().icon}>{props.icon}</span>;
  };

  const renderFallback = () => {
    const customSlot = props.fallbackSlot;
    if (customSlot !== undefined && customSlot !== null) {
      return (
        <span class={resolvedClasses().fallback} data-slot="fallback">
          {customSlot}
        </span>
      );
    }

    if (props.icon) {
      return (
        <span class={resolvedClasses().fallback} data-slot="fallback">
          {renderIcon()}
        </span>
      );
    }

    const textVal = fallbackText();
    if (textVal) {
      return (
        <span class={resolvedClasses().fallback} data-slot="fallback">
          {textVal}
        </span>
      );
    }

    return (
      <span class={resolvedClasses().fallback} data-slot="fallback">
        <RLIcon
          name="user"
          class={resolvedClasses().icon}
          ui={{ root: resolvedClasses().icon }}
          aria-hidden="true"
        />
      </span>
    );
  };

  const avatarContent = () => {
    if (props.children) return props.children;
    if (hasImage()) {
      return (
        <img
          src={props.src}
          alt={props.alt ?? ""}
          class={resolvedClasses().image}
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

  const avatarElement = () => (
    <Root
      class={resolvedClasses().root}
      data-slot="root"
      aria-label={props.label || props.title || props.alt}
      role={props.label || props.title || (!hasImage() && props.alt) ? "img" : undefined}
      {...rest}
    >
      {avatarContent()}
    </Root>
  );

  const chipConfig = createMemo(() => {
    const chipProp = props.chip;
    const badgeProp = props.badge || props.badgeSlot;
    if (!chipProp && !badgeProp) return null;

    let config: Record<string, any> = {};

    if (typeof chipProp === "object" && chipProp !== null) {
      config = { ...chipProp };
    } else if (chipProp === true) {
      config = { inset: true };
    }

    if (badgeProp) {
      config["position"] = props.badgePosition ?? config["position"] ?? "bottom-right";
      config["inset"] = config["inset"] ?? true;
      if (props.badgeColor) config["color"] = props.badgeColor;
      if (props.badgeSlot) config["content"] = props.badgeSlot;
      else if (typeof props.badge === "string" || typeof props.badge === "number") {
        config["text"] = props.badge;
      }
    }

    return config;
  });

  const withChip = () => {
    const cfg = chipConfig();
    if (!cfg) return avatarElement();

    return (
      <RLChip size={props.size as any} {...cfg}>
        {avatarElement()}
      </RLChip>
    );
  };

  const hasProfile = () => Boolean(props.title || props.subtitle);

  return (
    <Show when={hasProfile()} fallback={withChip()}>
      <div class={resolvedClasses().wrapper} data-slot="profile-wrapper">
        {withChip()}
        <div class="flex flex-col leading-tight">
          <Show when={props.title}>
            <span class={resolvedClasses().title} data-slot="title">
              {props.title}
            </span>
          </Show>
          <Show when={props.subtitle}>
            <span class={resolvedClasses().subtitle} data-slot="subtitle">
              {props.subtitle}
            </span>
          </Show>
        </div>
      </div>
    </Show>
  );
};

export { RLAvatar };
