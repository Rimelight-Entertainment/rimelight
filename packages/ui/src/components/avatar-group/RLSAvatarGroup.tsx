import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { AvatarGroupProps } from "./avatar-group"
import { avatarGroupTheme } from "./avatar-group.theme"
import RLSAvatar from "../avatar/RLSAvatar"

export interface RLSAvatarGroupProps extends AvatarGroupProps {
  children?: JSX.Element
}

const sizePx: Record<string, number> = {
  "3xs": 16,
  "2xs": 20,
  "xs": 24,
  "sm": 28,
  "md": 32,
  "lg": 36,
  "xl": 40,
  "2xl": 44,
  "3xl": 48
}

const sizeCls: Record<string, string> = {
  "3xs": "size-4 text-[7px]",
  "2xs": "size-5 text-[8px]",
  "xs": "size-6 text-[9px]",
  "sm": "size-7 text-[10px]",
  "md": "size-8 text-[11px]",
  "lg": "size-9 text-xs",
  "xl": "size-10 text-xs",
  "2xl": "size-11 text-sm",
  "3xl": "size-12 text-sm"
}

const RLSAvatarGroup: Component<RLSAvatarGroupProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "items",
    "displayLimit",
    "size",
    "ui",
    "class",
    "children"
  ])

  const normalizedItems = props.items ?? []
  const displayLimit = props.displayLimit ?? 5
  const size = props.size ?? "md"

  const resolvedClasses = createMemo(() => avatarGroupTheme({ ui: props.ui, class: props.class }))

  const uid = Math.random().toString(36).substring(2, 9)
  const cName = `rla-ag-${uid}`

  const avatarPx = sizePx[size] ?? 32
  const overlapPx = 12
  const effectivePx = avatarPx - overlapPx
  const morePx = avatarPx + 4

  const renderedItems = normalizedItems.slice(0, displayLimit)
  const baseHiddenCount = Math.max(0, normalizedItems.length - displayLimit)
  const needsOverflow = normalizedItems.length >= displayLimit

  let instanceCss = ""
  if (needsOverflow && renderedItems.length > 1) {
    const maxBreaks = renderedItems.length - 1
    for (let i = 0; i < maxBreaks; i++) {
      const hiddenItems = i + 1
      const visibleCount = renderedItems.length - hiddenItems
      const maxWidth = avatarPx + Math.max(0, visibleCount - 1) * effectivePx + morePx + 4
      const hideNthChild = renderedItems.length - i

      instanceCss += `\n@container ${cName} (max-width: ${maxWidth}px) {`
      instanceCss += `\n  [data-ag="${uid}"] { --hidden-items: ${hiddenItems}; }`
      instanceCss += `\n  [data-ag="${uid}"] > .rla-ag-item.hidable:nth-child(${hideNthChild}) { display: none; }`
      if (baseHiddenCount === 0) {
        instanceCss += `\n  [data-ag="${uid}"] > .rla-ag-more-hidden { display: inline-flex; }`
      }
      instanceCss += `\n}`
    }
  }

  if (normalizedItems.length > 0) {
    return (
      <>
        <div
          class="rla-ag-host"
          style={`container-type: inline-size; container-name: ${cName};`}
          {...rest}
        >
          <div
            class={`${resolvedClasses().root} rla-ag-list`}
            data-slot="avatar-group"
            data-ag={uid}
            style={`--base-hidden: ${baseHiddenCount}; --hidden-items: 0;`}
          >
            <For each={renderedItems}>
              {(item, idx) => (
                <span class={needsOverflow && idx() > 0 ? "rla-ag-item hidable" : "rla-ag-item"}>
                  <RLSAvatar
                    src={item.src}
                    alt={item.alt ?? ""}
                    fallback={item.fallback}
                    initials={item.initials}
                    size={size}
                    color={(item.color ?? "neutral") as any}
                  />
                </span>
              )}
            </For>

            {needsOverflow && (
              <span
                class={`${resolvedClasses().more} ${sizeCls[size] ?? sizeCls["md"]} rla-ag-more${baseHiddenCount === 0 ? " rla-ag-more-hidden" : ""}`}
                aria-hidden="true"
                data-slot="more"
              >
                +<span class="rla-ag-count" />
              </span>
            )}
          </div>
        </div>

        <style>{instanceCss}</style>

        <style>{`
          .rla-ag-host {
            display: inline-block;
          }

          .rla-ag-item {
            display: inline-flex;
            flex-shrink: 0;
          }

          .rla-ag-more {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            white-space: nowrap;
            font-feature-settings: "tnum";
          }

          .rla-ag-more-hidden {
            display: none;
          }

          .rla-ag-count::after {
            counter-reset: rla-ag-cnt calc(var(--base-hidden, 0) + var(--hidden-items, 0));
            content: counter(rla-ag-cnt);
          }
        `}</style>
      </>
    )
  }

  return (
    <div class={resolvedClasses().root} data-slot="avatar-group" {...rest}>
      {props.children}
    </div>
  )
}

export default RLSAvatarGroup
