import { createMemo, omit, For, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { AvatarGroupProps } from "./avatar-group"
import { avatarGroupTheme } from "./avatar-group.theme"
import RLAvatar from "../avatar/RLAvatar"

export interface RLAvatarGroupProps extends AvatarGroupProps {
  children?: JSX.Element
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

const RLAvatarGroup: Component<RLAvatarGroupProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "items", "displayLimit", "size", "ui", "class", "children")

  const normalizedItems = () => props.items ?? []
  const displayLimit = () => props.displayLimit ?? 5
  const size = () => props.size ?? "md"

  const resolvedClasses = createMemo(() => avatarGroupTheme({ ui: props.ui, class: props.class }))

  const renderedItems = () => normalizedItems().slice(0, displayLimit())
  const hiddenCount = () => normalizedItems().length - displayLimit()

  return (
    <>
      {normalizedItems().length > 0 ? (
        <div class={resolvedClasses().root} data-slot="avatar-group" {...rest}>
          <For each={renderedItems()}>
            {(item) => (
              <span class="inline-flex shrink-0">
                <RLAvatar
                  src={item.src}
                  alt={item.alt ?? ""}
                  fallback={item.fallback}
                  initials={item.initials}
                  size={size()}
                  color={(item.color ?? "neutral") as any}
                />
              </span>
            )}
          </For>

          {hiddenCount() > 0 && (
            <span
              class={`${resolvedClasses().more} ${sizeCls[size()] ?? sizeCls["md"]}`}
              aria-hidden="true"
              data-slot="more"
            >
              +{hiddenCount()}
            </span>
          )}
        </div>
      ) : (
        <div class={resolvedClasses().root} data-slot="avatar-group" {...rest}>
          {props.children}
        </div>
      )}
    </>
  )
}

export { RLAvatarGroup }
export default RLAvatarGroup
