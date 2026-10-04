import { createMemo, omit, children, type Component, Show } from "solid-js";
import type { RLCardProps } from "./card";
import { cardTheme } from "./card.theme";

export const RLCard: Component<RLCardProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "title",
    "description",
    "mediaSrc",
    "href",
    "overlay",
    "variant",
    "theme",
    "ui",
    "class",
    "children",
    "header",
    "footer",
    "media",
  );

  const resolvedClasses = createMemo(() =>
    cardTheme({
      variant: props.variant,
      interactive: !!props.href,
      overlay: !!props.overlay,
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
  );

  const resolvedChildren = children(() => props.children);
  const resolvedHeader = children(() => props.header);
  const resolvedFooter = children(() => props.footer);
  const resolvedMedia = children(() => props.media);

  const cardInner = () => (
    <>
      <Show when={resolvedMedia()}>{resolvedMedia()}</Show>
      <Show when={!resolvedMedia() && props.mediaSrc}>
        <div class={resolvedClasses().media} data-slot="media">
          <img src={props.mediaSrc} alt={props.title || ""} class="h-full w-full object-cover" />
        </div>
      </Show>

      <Show
        when={props.overlay}
        fallback={
          <>
            <Show when={resolvedHeader()}>{resolvedHeader()}</Show>
            <Show when={!resolvedHeader() && (props.title || props.description)}>
              <div class={resolvedClasses().header} data-slot="header">
                <Show when={props.title}>
                  <div class={resolvedClasses().title} data-slot="title">
                    {props.title}
                  </div>
                </Show>
                <Show when={props.description}>
                  <div class={resolvedClasses().description} data-slot="description">
                    {props.description}
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={resolvedChildren()}>
              <div class={resolvedClasses().body} data-slot="body">
                {resolvedChildren()}
              </div>
            </Show>

            <Show when={resolvedFooter()}>
              <div class={resolvedClasses().footer} data-slot="footer">
                {resolvedFooter()}
              </div>
            </Show>
          </>
        }
      >
        <div class={resolvedClasses().overlay} data-slot="overlay">
          <Show when={props.title}>
            <div class={resolvedClasses().title} data-slot="title">
              {props.title}
            </div>
          </Show>
          <Show when={props.description}>
            <div class={resolvedClasses().description} data-slot="description">
              {props.description}
            </div>
          </Show>
          {resolvedChildren()}
        </div>
      </Show>
    </>
  );

  return (
    <Show
      when={props.href}
      fallback={
        <div class={resolvedClasses().root} data-slot="card-root" {...rest}>
          {cardInner()}
        </div>
      }
    >
      <a
        href={props.href}
        class={`${resolvedClasses().root} no-underline`}
        data-slot="card-root"
        {...rest}
      >
        {cardInner()}
      </a>
    </Show>
  );
};
