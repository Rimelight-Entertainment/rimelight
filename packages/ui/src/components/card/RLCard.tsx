import { Show, type Component } from "solid-js";
import type { RLCardProps } from "./card.types";
import { RLCardTheme } from "./card.theme";

export const RLCard: Component<RLCardProps> = (props) => {
  const { Tag, classes, rest, id, slots, children, theme } = RLCardTheme.setup(props, {
    as: (): "a" | "div" => (props.href ? "a" : "div"),
    idPrefix: "rl-card",
    slots: [
      "title",
      "description",
      "mediaSrc",
      "href",
      "target",
      "rel",
      "aria-labelledby",
      "aria-describedby",
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
  const hasTitle = () => slots.titleSlot() !== undefined || slots.title() !== undefined;
  const hasDescription = () =>
    slots.descriptionSlot() !== undefined || slots.description() !== undefined;
  const hasBody = () => slots.bodySlot() !== undefined || children() !== undefined;

  return (
    <Tag
      id={id()}
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      href={slots.href()}
      target={slots.target()}
      rel={slots.rel() ?? (slots.target() === "_blank" ? "noopener noreferrer" : undefined)}
      aria-labelledby={slots["aria-labelledby"]() ?? (hasTitle() ? titleId() : undefined)}
      aria-describedby={
        slots["aria-describedby"]() ?? (hasDescription() ? descriptionId() : undefined)
      }
      {...rest}
    >
      {/* Media */}
      <Show when={slots.mediaSlot() ?? slots.mediaSrc()}>
        <Show
          when={slots.mediaSlot()}
          fallback={
            <Show when={slots.mediaSrc()}>
              {(src) => (
                <div class={classes().media} data-slot="media">
                  <img
                    src={src()}
                    alt={typeof slots.title() === "string" ? (slots.title() as string) : ""}
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
        when={slots.overlaySlot() !== undefined}
        fallback={
          <>
            {/* Header */}
            <Show when={slots.headerSlot() !== undefined || hasTitle() || hasDescription()}>
              <div class={classes().header} data-slot="header">
                <Show
                  when={slots.headerSlot()}
                  fallback={
                    <>
                      <Show when={hasTitle()}>
                        <div id={titleId()} class={classes().title} data-slot="title">
                          {slots.titleSlot() ?? slots.title()}
                        </div>
                      </Show>
                      <Show when={hasDescription()}>
                        <div
                          id={descriptionId()}
                          class={classes().description}
                          data-slot="description"
                        >
                          {slots.descriptionSlot() ?? slots.description()}
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
                {slots.bodySlot() ?? children()}
              </div>
            </Show>

            {/* Footer */}
            <Show when={slots.footerSlot() !== undefined}>
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
                    {slots.titleSlot() ?? slots.title()}
                  </div>
                </Show>
                <Show when={hasDescription()}>
                  <div id={descriptionId()} class={classes().description} data-slot="description">
                    {slots.descriptionSlot() ?? slots.description()}
                  </div>
                </Show>
                <Show when={hasBody()}>
                  <div class={classes().body} data-slot="body">
                    {slots.bodySlot() ?? children()}
                  </div>
                </Show>
                <Show when={slots.footerSlot() !== undefined}>
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
