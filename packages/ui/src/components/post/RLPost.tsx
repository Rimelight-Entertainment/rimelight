import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { PostProps } from "./post"
import { postTheme } from "./post.theme"
import RLBadge from "../badge/RLBadge"

export interface RLPostProps extends PostProps {
  children?: JSX.Element
  imageSlot?: JSX.Element
  titleSlot?: JSX.Element
  descriptionSlot?: JSX.Element
  badgeSlot?: JSX.Element
  dateSlot?: JSX.Element
  footerSlot?: JSX.Element
}

const RLPost: Component<RLPostProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "title",
    "description",
    "date",
    "image",
    "to",
    "badge",
    "badgeColor",
    "variant",
    "orientation",
    "ui",
    "class",
    "children",
    "imageSlot",
    "titleSlot",
    "descriptionSlot",
    "badgeSlot",
    "dateSlot",
    "footerSlot"
  )

  const classes = createMemo(() =>
    postTheme({
      variant: props.variant ?? "soft",
      orientation: props.orientation ?? "vertical",
      ui: props.ui,
      class: props.class
    })
  )

  const formattedDate = props.date
    ? props.date instanceof Date
      ? props.date.toLocaleDateString()
      : props.date
    : null

  const imageSrc = () =>
    typeof props.image === "string"
      ? props.image
      : (props.image as { src?: string } | undefined)?.src

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
        ) : formattedDate ? (
          <time class={classes()["date"]} data-slot="date">
            {formattedDate}
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
  )

  return props.to ? (
    <a href={props.to} class={classes()["root"]} data-slot="root" {...rest}>
      {body()}
    </a>
  ) : (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      {body()}
    </div>
  )
}

export { RLPost }
export default RLPost
