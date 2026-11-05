import { Show, type Component } from "solid-js";
import type { RLCardProps } from "./card.types";
import { RLCardTheme } from "./card.theme";
import { RLImage } from "../image/RLImage";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "title",
  "description",
  "mediaSrc",
  "href",
  "target",
  "rel",
  "aria-labelledby",
  "aria-describedby",
] as const;

export const RLCard: Component<RLCardProps> = (props) => {
  const { Tag, classes, rest, id, slots, children, theme } = RLCardTheme.setup(props, {
    as: (): "a" | "div" => (props.href ? "a" : "div"),
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
  });

  const titleId = () => `${id()}-title`;
  const descriptionId = () => `${id()}-description`;
  const hasTitle = () => slots.titleSlot() !== undefined || props.title !== undefined;
  const hasDescription = () =>
    slots.descriptionSlot() !== undefined || props.description !== undefined;
  const hasHeader = () => slots.headerSlot() !== undefined || hasTitle() || hasDescription();
  const hasBody = () => slots.bodySlot() !== undefined || children() !== undefined;
  const hasMedia = () => slots.mediaSlot() !== undefined || props.mediaSrc !== undefined;

  return (
    <Tag
      id={id()}
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      href={props.href}
      target={props.target}
      rel={props.rel ?? (props.target === "_blank" ? "noopener noreferrer" : undefined)}
      aria-labelledby={props["aria-labelledby"] ?? (hasTitle() ? titleId() : undefined)}
      aria-describedby={
        props["aria-describedby"] ?? (hasDescription() ? descriptionId() : undefined)
      }
      {...rest}
    >
      <Show when={hasMedia()}>
        <Show
          when={slots.mediaSlot()}
          fallback={
            <Show when={props.mediaSrc}>
              {(src) => (
                <div class={classes().media} data-slot="media">
                  <RLImage
                    src={src()}
                    alt={props.title ?? ""}
                    class={classes().image}
                    lightbox={false}
                  />
                </div>
              )}
            </Show>
          }
        >
          {renderSlot(slots.mediaSlot())}
        </Show>
      </Show>

      <Show
        when={slots.overlaySlot()}
        fallback={
          <>
            <Show when={hasHeader()}>
              <div class={classes().header} data-slot="header">
                <Show
                  when={slots.headerSlot()}
                  fallback={
                    <>
                      <Show when={hasTitle()}>
                        <div id={titleId()} class={classes().title} data-slot="title">
                          <Show when={slots.titleSlot()} fallback={props.title}>
                            {renderSlot(slots.titleSlot())}
                          </Show>
                        </div>
                      </Show>
                      <Show when={hasDescription()}>
                        <div
                          id={descriptionId()}
                          class={classes().description}
                          data-slot="description"
                        >
                          <Show when={slots.descriptionSlot()} fallback={props.description}>
                            {renderSlot(slots.descriptionSlot())}
                          </Show>
                        </div>
                      </Show>
                    </>
                  }
                >
                  {renderSlot(slots.headerSlot())}
                </Show>
              </div>
            </Show>

            <Show when={hasBody()}>
              <div class={classes().body} data-slot="body">
                <Show when={slots.bodySlot()} fallback={children()}>
                  {renderSlot(slots.bodySlot())}
                </Show>
              </div>
            </Show>

            <Show when={slots.footerSlot()}>
              <div class={classes().footer} data-slot="footer">
                {renderSlot(slots.footerSlot())}
              </div>
            </Show>
          </>
        }
      >
        <div class={classes().overlay} data-slot="overlay">
          {renderSlot(slots.overlaySlot())}
        </div>
      </Show>
    </Tag>
  );
};
