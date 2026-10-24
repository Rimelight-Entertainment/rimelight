import type { RLPostProps } from "./post.types";
import { RLPostTheme } from "./post.theme";
import { createMemo, type Component } from "solid-js";
import { RLBadge } from "../badge/RLBadge";

const OMIT_KEYS = [
  "title",
  "description",
  "date",
  "image",
  "href",
  "to",
  "badge",
  "badgeColor",
  "imageSlot",
  "titleSlot",
  "descriptionSlot",
  "badgeSlot",
  "dateSlot",
  "footerSlot",
] as const;

export const RLPost: Component<RLPostProps> = (props) => {
  const link = () => props.href || props.to;
  const { Tag, classes, rest } = RLPostTheme.setup(props, {
    as: () => (link() ? "a" : "div"),
    omit: OMIT_KEYS,
  });

  const formattedDate = createMemo(() =>
    props.date
      ? props.date instanceof Date
        ? props.date.toLocaleDateString("en-US", {
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
      {props.imageSlot !== undefined ? (
        props.imageSlot
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
        {props.titleSlot !== undefined ? (
          props.titleSlot
        ) : props.title ? (
          <h3 class={classes()["title"]} data-slot="title">
            {props.title}
          </h3>
        ) : null}

        {props.descriptionSlot !== undefined ? (
          props.descriptionSlot
        ) : props.description ? (
          <p class={classes()["description"]} data-slot="description">
            {props.description}
          </p>
        ) : null}

        {props.badgeSlot !== undefined ? (
          props.badgeSlot
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

        {props.dateSlot !== undefined ? (
          props.dateSlot
        ) : formattedDate() ? (
          <time class={classes()["date"]} data-slot="date">
            {formattedDate()}
          </time>
        ) : null}

        {props.children}
      </div>

      {props.footerSlot !== undefined && (
        <div class={classes()["footer"]} data-slot="footer">
          {props.footerSlot}
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
