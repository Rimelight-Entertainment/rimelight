import { createMemo, omit, For, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { AccordionItem, AccordionProps } from "./accordion"
import { accordionTheme } from "./accordion.theme"
import RLIcon from "../icon/RLIcon"

export interface RLAccordionProps extends AccordionProps {
  children?: JSX.Element
  trailingIconSlot?: JSX.Element
}

const RLAccordion: Component<RLAccordionProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "items",
    "summary",
    "multiple",
    "trailingIcon",
    "disabled",
    "name",
    "ui",
    "class",
    "children",
    "trailingIconSlot"
  )

  const groupName =
    props.name ||
    (!props.multiple ? `accordion-${Math.random().toString(36).substring(2, 9)}` : undefined)

  const resolvedClasses = createMemo(() =>
    accordionTheme({
      disabled: props.disabled ? true : false,
      ui: props.ui,
      class: props.class
    })
  )

  const trailingIcon = () => props.trailingIcon ?? "chevronDown"

  return props.items && props.items.length > 0 ? (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <For each={props.items}>
        {(item: AccordionItem) => {
          const itemDisabled = () => !!(props.disabled || item.disabled)
          const itemTrailingIcon = () => (item.trailingIcon as string | undefined) || trailingIcon()
          return (
            <details
              class={resolvedClasses().item}
              data-slot="item"
              name={props.name || (!props.multiple ? groupName : undefined)}
            >
              <summary
                class={`${resolvedClasses().trigger} ${itemDisabled() ? "pointer-events-none opacity-50 select-none" : ""}`}
                data-slot="trigger"
              >
                {item.icon ? (
                  <span class={resolvedClasses().leadingIcon} data-slot="leading-icon">
                    <span class={item.icon} aria-hidden="true" />
                  </span>
                ) : null}

                <span class={resolvedClasses().label} data-slot="label">
                  {item.label}
                </span>

                {itemTrailingIcon() ? (
                  <span class={resolvedClasses().trailingIcon} data-slot="trailing-icon">
                    {props.trailingIconSlot ?? <RLIcon name={itemTrailingIcon()} size="md" />}
                  </span>
                ) : null}
              </summary>

              <div class={resolvedClasses().content} data-slot="content">
                <div class={resolvedClasses().body} data-slot="body">
                  {item.content}
                </div>
              </div>
            </details>
          )
        }}
      </For>
    </div>
  ) : (
    <details
      class={`${resolvedClasses().root} ${resolvedClasses().item}`}
      data-slot="root"
      name={props.name}
      {...rest}
    >
      <summary
        class={`${resolvedClasses().trigger} ${props.disabled ? "pointer-events-none opacity-50 select-none" : ""}`}
        data-slot="trigger"
      >
        <span class={resolvedClasses().label} data-slot="label">
          {props.summary}
        </span>
        {trailingIcon() ? (
          <span class={resolvedClasses().trailingIcon} data-slot="trailing-icon">
            {props.trailingIconSlot ?? <RLIcon name={trailingIcon()} size="md" />}
          </span>
        ) : null}
      </summary>

      <div class={resolvedClasses().content} data-slot="content">
        <div class={resolvedClasses().body} data-slot="body">
          {props.children}
        </div>
      </div>
    </details>
  )
}

export { RLAccordion }
export default RLAccordion
