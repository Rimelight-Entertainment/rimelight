import type { RLCardProps } from "./card.types";
import { RLCardTheme } from "./card.theme";
import { createMemo, createUniqueId, omit, Show, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";

export const RLCard: Component<RLCardProps> = (props) => {
  const rest = omit(
    props,
    "as",
    "title",
    "description",
    "variant",
    "mediaSrc",
    "overlay",
    "overlaySlot",
    "href",
    "target",
    "rel",
    "id",
    "role",
    "ariaLabel",
    "ariaLabelledby",
    "ariaDescribedby",
    "theme",
    "ui",
    "class",
    "children",
    "header",
    "headerSlot",
    "titleSlot",
    "descriptionSlot",
    "body",
    "bodySlot",
    "footer",
    "footerSlot",
    "media",
    "mediaSlot",
  );

  const cardId = props.id || `rl-card-${createUniqueId()}`;
  const titleId = `${cardId}-title`;
  const descriptionId = `${cardId}-description`;

  const isInteractive = () => Boolean(props.href);
  const isOverlay = () => Boolean(props.overlaySlot !== undefined || props.overlay);

  const Tag = dynamic(() => props.as ?? (isInteractive() ? "a" : "div"));

  const hasHeaderSlot = () => Boolean(props.headerSlot !== undefined || props.header !== undefined);
  const hasTitle = () => Boolean(props.titleSlot !== undefined || props.title !== undefined);
  const hasDescription = () =>
    Boolean(props.descriptionSlot !== undefined || props.description !== undefined);
  const hasHeader = () => Boolean(hasHeaderSlot() || hasTitle() || hasDescription());

  const hasBody = () =>
    Boolean(
      props.bodySlot !== undefined || props.body !== undefined || props.children !== undefined,
    );
  const hasFooter = () => Boolean(props.footerSlot !== undefined || props.footer !== undefined);
  const hasMedia = () =>
    Boolean(
      props.mediaSlot !== undefined || props.media !== undefined || props.mediaSrc !== undefined,
    );

  const classes = createMemo(() =>
    RLCardTheme({
      variant: props.variant ?? "outline",
      overlay: isOverlay(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const linkHref = () => props.href;
  const linkRel = () =>
    props.rel ?? (props.target === "_blank" ? "noopener noreferrer" : undefined);

  return (
    <Tag
      id={props.id}
      class={classes().root}
      data-slot="root"
      role={props.role}
      aria-labelledby={props.ariaLabelledby ?? (hasTitle() ? titleId : undefined)}
      aria-describedby={props.ariaDescribedby ?? (hasDescription() ? descriptionId : undefined)}
      aria-label={props.ariaLabel}
      href={linkHref()}
      target={props.target}
      rel={linkRel()}
      data-theme={props.theme}
      {...rest}
    >
      {/* Media */}
      <Show when={hasMedia()}>
        <Show
          when={props.mediaSlot ?? props.media}
          fallback={
            <Show when={props.mediaSrc}>
              {(src) => (
                <div class={classes().media} data-slot="media">
                  <img
                    src={src()}
                    alt={typeof props.title === "string" ? props.title : ""}
                    class="h-full w-full object-cover"
                  />
                </div>
              )}
            </Show>
          }
        >
          {props.mediaSlot ?? props.media}
        </Show>
      </Show>

      <Show
        when={isOverlay()}
        fallback={
          <>
            {/* Header */}
            <Show when={hasHeader()}>
              <div class={classes().header} data-slot="header">
                <Show
                  when={props.headerSlot ?? props.header}
                  fallback={
                    <>
                      <Show when={hasTitle()}>
                        <div id={titleId} class={classes().title} data-slot="title">
                          {props.titleSlot ?? props.title}
                        </div>
                      </Show>
                      <Show when={hasDescription()}>
                        <div
                          id={descriptionId}
                          class={classes().description}
                          data-slot="description"
                        >
                          {props.descriptionSlot ?? props.description}
                        </div>
                      </Show>
                    </>
                  }
                >
                  {props.headerSlot ?? props.header}
                </Show>
              </div>
            </Show>

            {/* Body */}
            <Show when={hasBody()}>
              <div class={classes().body} data-slot="body">
                {props.bodySlot ?? props.body ?? props.children}
              </div>
            </Show>

            {/* Footer */}
            <Show when={hasFooter()}>
              <div class={classes().footer} data-slot="footer">
                {props.footerSlot ?? props.footer}
              </div>
            </Show>
          </>
        }
      >
        <div class={classes().overlay} data-slot="overlay">
          <Show
            when={
              props.overlaySlot ?? (typeof props.overlay !== "boolean" ? props.overlay : undefined)
            }
            fallback={
              <>
                <Show when={hasTitle()}>
                  <div id={titleId} class={classes().title} data-slot="title">
                    {props.titleSlot ?? props.title}
                  </div>
                </Show>
                <Show when={hasDescription()}>
                  <div id={descriptionId} class={classes().description} data-slot="description">
                    {props.descriptionSlot ?? props.description}
                  </div>
                </Show>
                <Show when={hasBody()}>
                  <div class={classes().body} data-slot="body">
                    {props.bodySlot ?? props.body ?? props.children}
                  </div>
                </Show>
                <Show when={hasFooter()}>
                  <div class={classes().footer} data-slot="footer">
                    {props.footerSlot ?? props.footer}
                  </div>
                </Show>
              </>
            }
          >
            {props.overlaySlot ?? (typeof props.overlay !== "boolean" ? props.overlay : undefined)}
          </Show>
        </div>
      </Show>
    </Tag>
  );
};
