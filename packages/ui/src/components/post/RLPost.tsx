import type { RLPostProps } from "./post.types";
import { RLPostTheme } from "./post.theme";
import { createMemo, Show, type Component } from "solid-js";
import { RLBadge } from "../badge/RLBadge";
import { RLImage } from "../image/RLImage";
import { localizeHref } from "../link/link.helpers";
import { renderSlot } from "../../slot";
import { getLocaleInfo } from "@rimelight/i18n";

const OMIT_KEYS = [
  "title",
  "description",
  "date",
  "image",
  "href",
  "localize",
  "badge",
  "badgeColor",
] as const;

export const RLPost: Component<RLPostProps> = (props) => {
  const link = createMemo(() => localizeHref(props.href, props.localize));
  const { Tag, classes, rest, slots, children, theme } = RLPostTheme.setup(props, {
    slots: [
      "imageSlot",
      "titleSlot",
      "descriptionSlot",
      "badgeSlot",
      "dateSlot",
      "footerSlot",
    ] as const,
    as: () => (link() ? "a" : "div"),
    omit: OMIT_KEYS,
  });

  const imageSrc = createMemo(() =>
    typeof props.image === "string" ? props.image : props.image?.src,
  );

  const formattedDate = createMemo(() =>
    props.date
      ? props.date instanceof Date
        ? props.date.toLocaleDateString(getLocaleInfo().tag, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : props.date
      : null,
  );

  return (
    <Tag href={link()} data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show when={slots.imageSlot() !== undefined || Boolean(imageSrc())}>
        <Show
          when={slots.imageSlot() !== undefined}
          fallback={
            <div class={classes().imageWrapper} data-slot="image-wrapper">
              <RLImage
                src={imageSrc()}
                alt={props.title ?? ""}
                lightbox={false}
                class={classes().image}
              />
            </div>
          }
        >
          {renderSlot(slots.imageSlot())}
        </Show>
      </Show>

      <div class={classes().body} data-slot="body">
        <Show when={slots.titleSlot() !== undefined || Boolean(props.title)}>
          <Show
            when={slots.titleSlot() !== undefined}
            fallback={
              <h3 class={classes().title} data-slot="title">
                {props.title}
              </h3>
            }
          >
            {renderSlot(slots.titleSlot())}
          </Show>
        </Show>

        <Show when={slots.descriptionSlot() !== undefined || Boolean(props.description)}>
          <Show
            when={slots.descriptionSlot() !== undefined}
            fallback={
              <p class={classes().description} data-slot="description">
                {props.description}
              </p>
            }
          >
            {renderSlot(slots.descriptionSlot())}
          </Show>
        </Show>

        <Show when={slots.badgeSlot() !== undefined || Boolean(props.badge)}>
          <Show
            when={slots.badgeSlot() !== undefined}
            fallback={
              <RLBadge
                color={props.badgeColor}
                size="sm"
                shape="pill"
                class={classes().badge}
                data-slot="badge"
              >
                {props.badge}
              </RLBadge>
            }
          >
            {renderSlot(slots.badgeSlot())}
          </Show>
        </Show>

        <Show when={slots.dateSlot() !== undefined || Boolean(formattedDate())}>
          <Show
            when={slots.dateSlot() !== undefined}
            fallback={
              <time class={classes().date} data-slot="date">
                {formattedDate()}
              </time>
            }
          >
            {renderSlot(slots.dateSlot())}
          </Show>
        </Show>

        {children()}
      </div>

      <Show when={slots.footerSlot() !== undefined}>
        <div class={classes().footer} data-slot="footer">
          {renderSlot(slots.footerSlot())}
        </div>
      </Show>
    </Tag>
  );
};
