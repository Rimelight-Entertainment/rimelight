import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { CardProps } from "./card";
import { cardTheme } from "./card.theme";

export interface RLCardProps extends CardProps {
  children?: JSX.Element;
  header?: JSX.Element;
  footer?: JSX.Element;
  media?: JSX.Element;
}

const RLCard: Component<RLCardProps> = (allProps) => {
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

  const content = () => (
    <>
      {props.media ? (
        props.media
      ) : props.mediaSrc ? (
        <div class={resolvedClasses().media} data-slot="media">
          <img src={props.mediaSrc} alt={props.title || ""} class="h-full w-full object-cover" />
        </div>
      ) : null}

      {props.overlay ? (
        <div class={resolvedClasses().overlay} data-slot="overlay">
          {props.title ? (
            <div class={resolvedClasses().title} data-slot="title">
              {props.title}
            </div>
          ) : null}
          {props.description ? (
            <div class={resolvedClasses().description} data-slot="description">
              {props.description}
            </div>
          ) : null}
          {props.children}
        </div>
      ) : (
        <>
          {props.header ? (
            props.header
          ) : props.title || props.description ? (
            <div class={resolvedClasses().header} data-slot="header">
              {props.title ? (
                <div class={resolvedClasses().title} data-slot="title">
                  {props.title}
                </div>
              ) : null}
              {props.description ? (
                <div class={resolvedClasses().description} data-slot="description">
                  {props.description}
                </div>
              ) : null}
            </div>
          ) : null}

          {props.children ? (
            <div class={resolvedClasses().body} data-slot="body">
              {props.children}
            </div>
          ) : null}

          {props.footer ? (
            <div class={resolvedClasses().footer} data-slot="footer">
              {props.footer}
            </div>
          ) : null}
        </>
      )}
    </>
  );

  if (props.href) {
    return (
      <a
        href={props.href}
        class={`${resolvedClasses().root} no-underline`}
        data-slot="card-root"
        {...rest}
      >
        {content()}
      </a>
    );
  }

  return (
    <div class={resolvedClasses().root} data-slot="card-root" {...rest}>
      {content()}
    </div>
  );
};

export { RLCard };
