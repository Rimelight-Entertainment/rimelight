import type { RLPostProps } from "./post.types";
import { RLPostTheme } from "./post.theme";
import { createMemo, type Component } from "solid-js";
import { RLBadge } from "../badge/RLBadge";
import { localizeHref } from "../link/helpers";
import { getLocaleInfo } from "@rimelight/i18n";

const OMIT_KEYS = [
  "title",
  "description",
  "date",
  "image",
  "href",
  "to",
  "localize",
  "badge",
  "badgeColor",
] as const;

export const RLPost: Component<RLPostProps> = (props) => {
  const link = () => localizeHref(props.href || props.to, props.localize);
  const { Tag, classes, rest, slots } = RLPostTheme.setup(props, {
    slots: [
      "imageSlot",
      "badgeSlot",
      "dateSlot",
      "titleSlot",
      "descriptionSlot",
      "footerSlot",
    ] as const,
    as: () => (link() ? "a" : "div"),
    omit: OMIT_KEYS,
  });

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

  const imageSrc = () =>
    typeof props.image === "string"
      ? props.image
      : (props.image as { src?: string } | undefined)?.src;

  const body = () => (
    <>
      {slots.imageSlot() !== undefined ? (
        slots.imageSlot()
      ) : props.image ? (
        <div class={classes()["imageWrapper"]} data-slot="image-wrapper">
          <img
            src={imageSrc()}
            alt={props.title || ""}
            class={classes()["image"]}
            data-slot="image"
          />
        </div>
      ) : null}

      <div class={classes()["content"]} data-slot="content">
        {slots.titleSlot() !== undefined ? (
          slots.titleSlot()
        ) : props.title ? (
          <h3 class={classes()["title"]} data-slot="title">
            {props.title}
          </h3>
        ) : null}

        {slots.descriptionSlot() !== undefined ? (
          slots.descriptionSlot()
        ) : props.description ? (
          <p class={classes()["description"]} data-slot="description">
            {props.description}
          </p>
        ) : null}

        {slots.badgeSlot() !== undefined ? (
          slots.badgeSlot()
        ) : props.badge ? (
          <RLBadge
            color={(props.badgeColor ?? "primary") as any}
            size="sm"
            shape="pill"
            class={classes()["badge"]}
            data-slot="badge"
          >
            {props.badge}
          </RLBadge>
        ) : null}

        {slots.dateSlot() !== undefined ? (
          slots.dateSlot()
        ) : formattedDate() ? (
          <time class={classes()["date"]} data-slot="date">
            {formattedDate()}
          </time>
        ) : null}

        {props.children}
      </div>

      {slots.footerSlot() !== undefined && (
        <div class={classes()["footer"]} data-slot="footer">
          {slots.footerSlot()}
        </div>
      )}
    </>
  );

  return (
    <Tag href={link()} class={classes().root} data-slot="root" {...rest}>
      {body()}
    </Tag>
  );
};
