import { createMemo, splitProps, For, Show, type Component, type JSX } from "solid-js"
import type { LinkGroupProps } from "./link-group"
import { linkGroupTheme } from "./link-group.theme"
import { linkTheme } from "../link/link.theme"
import { resolveLinkAttrs } from "../link/helpers"
import RLSIcon from "../icon/RLSIcon"

export interface RLSLinkGroupProps extends LinkGroupProps {
  children?: JSX.Element
}

const RLSLinkGroup: Component<RLSLinkGroupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "label",
    "leadingIcon",
    "trailingIcon",
    "href",
    "links",
    "theme",
    "ui",
    "class",
    "children"
  ])

  const resolvedClasses = createMemo(() =>
    linkGroupTheme({
      ui: props.ui,
      class: props.class
    })
  )

  const normalizedLinks = createMemo(() => {
    if (!props.links) return []
    return Array.isArray(props.links) ? props.links : [props.links]
  })

  return (
    <div class={resolvedClasses().root} data-slot="root" data-theme={props.theme} {...rest}>
      {props.label ? (
        <h4 class={resolvedClasses().title} data-slot="title">
          {props.href ? (
            <a href={props.href} class="hover:underline flex items-center gap-1.5">
              {props.leadingIcon && <RLSIcon name={props.leadingIcon} size="sm" />}
              <span>{props.label}</span>
              {props.trailingIcon && <RLSIcon name={props.trailingIcon} size="sm" />}
            </a>
          ) : (
            <span class="flex items-center gap-1.5">
              {props.leadingIcon && <RLSIcon name={props.leadingIcon} size="sm" />}
              <span>{props.label}</span>
              {props.trailingIcon && <RLSIcon name={props.trailingIcon} size="sm" />}
            </span>
          )}
        </h4>
      ) : null}

      <ul class={resolvedClasses().list} data-slot="list">
        <Show when={!props.children} fallback={props.children}>
          <For each={normalizedLinks()}>
            {(link) => {
              const linkClasses = createMemo(() =>
                linkTheme({
                  theme: link.theme ?? props.theme,
                  ...(link.active !== undefined ? { active: link.active } : {}),
                  disabled: !!link.disabled,
                  ui: link.ui,
                  class: `${resolvedClasses().link} w-full !justify-start`
                })
              )
              const attrs = createMemo(() => resolveLinkAttrs(link))
              return (
                <li class={resolvedClasses().item} data-slot="item">
                  <a
                    class={linkClasses()["root"]}
                    data-slot="link"
                    href={attrs().href}
                    target={attrs().target}
                    rel={attrs().rel}
                    aria-current={attrs().ariaCurrent}
                    aria-disabled={attrs().ariaDisabled}
                    aria-label={link.ariaLabel}
                  >
                    {link.leadingIcon && (
                      <span class={linkClasses()["leadingIcon"]} data-slot="leading-icon">
                        <RLSIcon name={link.leadingIcon} size="sm" aria-hidden="true" />
                      </span>
                    )}
                    {link.label && (
                      <span class={linkClasses()["label"]} data-slot="label">
                        {link.label}
                      </span>
                    )}
                    {attrs().showTrailingIcon && (
                      <span class={linkClasses()["trailingIcon"]} data-slot="trailing-icon">
                        <RLSIcon name={attrs().showTrailingIcon} size="sm" aria-hidden="true" />
                      </span>
                    )}
                  </a>
                </li>
              )
            }}
          </For>
        </Show>
      </ul>
    </div>
  )
}

export default RLSLinkGroup
