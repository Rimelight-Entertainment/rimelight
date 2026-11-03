import { Show, type Component } from "solid-js";
import type { RLCardProps } from "./card.types";
import { RLCardTheme } from "./card.theme";

const OMIT_KEYS = [
  "title",
  "description",
  "mediaSrc",
  "overlay",
  "href",
  "target",
  "rel",
  "id",
  "role",
  "ariaLabel",
  "ariaLabelledby",
  "ariaDescribedby",
] as const;

export const RLCard: Component<RLCardProps> = (props) => {
  const isInteractive = () => Boolean(props.href);

  const {
    Tag,
    classes,
    rest,
    id: cardId,
    slots,
  } = RLCardTheme.setup(props, {
    as: () => (isInteractive() ? "a" : "div"),
    omit: OMIT_KEYS,
    slots: [
      "headerSlot",
      "titleSlot",
      "descriptionSlot",
      "bodySlot",
      "footerSlot",
      "mediaSlot",
      "overlaySlot",
    ] as const,
    variants: (s) => ({
      overlay: s.overlaySlot() !== undefined || Boolean(props.overlay),
    }),
  });

  const isOverlay = () => Boolean(slots.overlaySlot() !== undefined || props.overlay);

  const titleId = () => `${cardId()}-title`;
  const descriptionId = () => `${cardId()}-description`;

  const hasHeaderSlot = () => slots.headerSlot() !== undefined;
  const hasTitle = () => Boolean(slots.titleSlot() !== undefined || props.title !== undefined);
  const hasDescription = () =>
    Boolean(slots.descriptionSlot() !== undefined || props.description !== undefined);
  const hasHeader = () => Boolean(hasHeaderSlot() || hasTitle() || hasDescription());

  const hasBody = () => Boolean(slots.bodySlot() !== undefined || props.children !== undefined);
  const hasFooter = () => slots.footerSlot() !== undefined;
  const hasMedia = () => Boolean(slots.mediaSlot() !== undefined || props.mediaSrc !== undefined);

  const linkHref = () => props.href;
  const linkRel = () =>
    props.rel ?? (props.target === "_blank" ? "noopener noreferrer" : undefined);

  return (
    <Tag
      id={props.id}
      class={classes().root}
      data-slot="root"
      role={props.role}
      aria-labelledby={props.ariaLabelledby ?? (hasTitle() ? titleId() : undefined)}
      aria-describedby={props.ariaDescribedby ?? (hasDescription() ? descriptionId() : undefined)}
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
          when={slots.mediaSlot()}
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
          {slots.mediaSlot()}
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
                  when={slots.headerSlot()}
                  fallback={
                    <>
                      <Show when={hasTitle()}>
                        <div id={titleId()} class={classes().title} data-slot="title">
                          {slots.titleSlot() ?? props.title}
                        </div>
                      </Show>
                      <Show when={hasDescription()}>
                        <div
                          id={descriptionId()}
                          class={classes().description}
                          data-slot="description"
                        >
                          {slots.descriptionSlot() ?? props.description}
                        </div>
                      </Show>
                    </>
                  }
                >
                  {slots.headerSlot()}
                </Show>
              </div>
            </Show>

            {/* Body */}
            <Show when={hasBody()}>
              <div class={classes().body} data-slot="body">
                {slots.bodySlot() ?? props.children}
              </div>
            </Show>

            {/* Footer */}
            <Show when={hasFooter()}>
              <div class={classes().footer} data-slot="footer">
                {slots.footerSlot()}
              </div>
            </Show>
          </>
        }
      >
        <div class={classes().overlay} data-slot="overlay">
          <Show
            when={slots.overlaySlot()}
            fallback={
              <>
                <Show when={hasTitle()}>
                  <div id={titleId()} class={classes().title} data-slot="title">
                    {slots.titleSlot() ?? props.title}
                  </div>
                </Show>
                <Show when={hasDescription()}>
                  <div id={descriptionId()} class={classes().description} data-slot="description">
                    {slots.descriptionSlot() ?? props.description}
                  </div>
                </Show>
                <Show when={hasBody()}>
                  <div class={classes().body} data-slot="body">
                    {slots.bodySlot() ?? props.children}
                  </div>
                </Show>
                <Show when={hasFooter()}>
                  <div class={classes().footer} data-slot="footer">
                    {slots.footerSlot()}
                  </div>
                </Show>
              </>
            }
          >
            {slots.overlaySlot()}
          </Show>
        </div>
      </Show>
    </Tag>
  );
};
