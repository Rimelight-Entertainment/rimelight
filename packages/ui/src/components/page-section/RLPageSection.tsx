import type { RLPageSectionProps } from "./page-section.types";
import { RLPageSectionTheme } from "./page-section.theme";
import { createMemo, omit, For, type Component, Show } from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";

export const RLPageSection: Component<RLPageSectionProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "variant",
    "ctaVariant",
    "headline",
    "icon",
    "title",
    "description",
    "links",
    "orientation",
    "reverse",
    "contentVisibility",
    "containIntrinsicSize",
    "ui",
    "class",
    "background",
    "top",
    "header",
    "leading",
    "headlineSlot",
    "titleSlot",
    "descriptionSlot",
    "body",
    "footer",
    "linksSlot",
    "content",
    "bottom",
    "children",
  );

  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "hero" || props.variant === "cta"
      ? props.variant
      : "default";

  const resolvedClasses = createMemo(() =>
    RLPageSectionTheme({
      variant: resolvedVariant(),
      ...(resolvedVariant() === "cta" ? { ctaVariant: props.ctaVariant ?? "solid" } : {}),
      orientation: props.orientation ?? "vertical",
      reverse: !!props.reverse,
      headline: !!(props.headlineSlot ?? props.headline),
      title: !!(props.titleSlot ?? props.title),
      description: !!(props.descriptionSlot ?? props.description),
      body: !!props.body,
      ui: props.ui,
      class: props.class,
    }),
  );

  const showHeader = () =>
    !!(
      props.header ||
      props.icon ||
      props.headline ||
      props.headlineSlot ||
      props.title ||
      props.titleSlot ||
      props.description ||
      props.descriptionSlot
    );

  const showWrapper = () =>
    !!(
      showHeader() ||
      props.body ||
      props.footer ||
      props.linksSlot ||
      (props.links?.length ?? 0) > 0
    );

  const Tag = dynamic(() => props.as!);

  if (props.as && props.as !== "section") {
    return (
      <Tag
        data-orientation={props.orientation ?? "vertical"}
        class={`${resolvedClasses().root} ${
          props.contentVisibility === "auto"
            ? "[content-visibility:auto] [contain-intrinsic-size:var(--rl-contain-intrinsic-size,auto_500px)]"
            : ""
        }`}
        style={
          props.containIntrinsicSize
            ? { "--rl-contain-intrinsic-size": props.containIntrinsicSize }
            : undefined
        }
        {...rest}
      >
        <Show when={props.background}>
          <div class={resolvedClasses().background} data-slot="background">
            {props.background}
          </div>
        </Show>

        {props.top}

        <div class={resolvedClasses().container}>
          <Show when={showWrapper()}>
            <div class={resolvedClasses().wrapper}>
              <Show when={props.header}>
                <div class={resolvedClasses().header}>{props.header}</div>
              </Show>

              <Show when={!props.header && showHeader()}>
                <div class={resolvedClasses().header}>
                  <Show when={props.icon || props.leading}>
                    <div class={resolvedClasses().leading}>
                      <Show
                        when={props.leading}
                        fallback={
                          <RLIcon
                            name={props.icon!}
                            size="md"
                            ui={{ root: resolvedClasses().leadingIcon }}
                          />
                        }
                      >
                        {props.leading}
                      </Show>
                    </div>
                  </Show>

                  <Show when={props.headline || props.headlineSlot}>
                    <div class={resolvedClasses().headline}>
                      {props.headlineSlot ?? props.headline}
                    </div>
                  </Show>

                  <Show when={props.title || props.titleSlot}>
                    {resolvedVariant() === "hero" ? (
                      <h1 class={resolvedClasses().title}>{props.titleSlot ?? props.title}</h1>
                    ) : (
                      <h2 class={resolvedClasses().title}>{props.titleSlot ?? props.title}</h2>
                    )}
                  </Show>

                  <Show when={props.description || props.descriptionSlot}>
                    <div class={resolvedClasses().description}>
                      {props.descriptionSlot ?? props.description}
                    </div>
                  </Show>
                </div>
              </Show>

              <Show when={props.body}>
                <div class={resolvedClasses().body}>{props.body}</div>
              </Show>

              <Show when={props.footer}>
                <div class={resolvedClasses().footer}>{props.footer}</div>
              </Show>

              <Show when={!props.footer && (props.linksSlot || (props.links?.length ?? 0) > 0)}>
                <div class={resolvedClasses().footer}>
                  <div class={resolvedClasses().links}>
                    <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                    {props.linksSlot}
                  </div>
                </div>
              </Show>
            </div>
          </Show>

          {props.children}

          <Show when={props.content}>
            <div class="col-span-full w-full">{props.content}</div>
          </Show>
        </div>

        {props.bottom}
      </Tag>
    );
  }

  return (
    <section
      data-orientation={props.orientation ?? "vertical"}
      class={`${resolvedClasses().root} ${
        props.contentVisibility === "auto"
          ? "[content-visibility:auto] [contain-intrinsic-size:var(--rl-contain-intrinsic-size,auto_500px)]"
          : ""
      }`}
      style={
        props.containIntrinsicSize
          ? { "--rl-contain-intrinsic-size": props.containIntrinsicSize }
          : undefined
      }
      {...rest}
    >
      <Show when={props.background}>
        <div class={resolvedClasses().background} data-slot="background">
          {props.background}
        </div>
      </Show>

      {props.top}

      <div class={resolvedClasses().container}>
        <Show when={showWrapper()}>
          <div class={resolvedClasses().wrapper}>
            <Show when={props.header}>
              <div class={resolvedClasses().header}>{props.header}</div>
            </Show>

            <Show when={!props.header && showHeader()}>
              <div class={resolvedClasses().header}>
                <Show when={props.icon || props.leading}>
                  <div class={resolvedClasses().leading}>
                    <Show
                      when={props.leading}
                      fallback={
                        <RLIcon
                          name={props.icon!}
                          size="md"
                          ui={{ root: resolvedClasses().leadingIcon }}
                        />
                      }
                    >
                      {props.leading}
                    </Show>
                  </div>
                </Show>

                <Show when={props.headline || props.headlineSlot}>
                  <div class={resolvedClasses().headline}>
                    {props.headlineSlot ?? props.headline}
                  </div>
                </Show>

                <Show when={props.title || props.titleSlot}>
                  {resolvedVariant() === "hero" ? (
                    <h1 class={resolvedClasses().title}>{props.titleSlot ?? props.title}</h1>
                  ) : (
                    <h2 class={resolvedClasses().title}>{props.titleSlot ?? props.title}</h2>
                  )}
                </Show>

                <Show when={props.description || props.descriptionSlot}>
                  <div class={resolvedClasses().description}>
                    {props.descriptionSlot ?? props.description}
                  </div>
                </Show>
              </div>
            </Show>

            <Show when={props.body}>
              <div class={resolvedClasses().body}>{props.body}</div>
            </Show>

            <Show when={props.footer}>
              <div class={resolvedClasses().footer}>{props.footer}</div>
            </Show>

            <Show when={!props.footer && (props.linksSlot || (props.links?.length ?? 0) > 0)}>
              <div class={resolvedClasses().footer}>
                <div class={resolvedClasses().links}>
                  <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                  {props.linksSlot}
                </div>
              </div>
            </Show>
          </div>
        </Show>

        {props.children}

        <Show when={props.content}>
          <div class="col-span-full w-full">{props.content}</div>
        </Show>
      </div>

      {props.bottom}
    </section>
  );
};
