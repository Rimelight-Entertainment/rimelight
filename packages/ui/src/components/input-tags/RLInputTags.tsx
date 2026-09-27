import { createMemo, createSignal, For, Show, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { InputTagsProps, TagItem } from "./input-tags"
import { inputTagsTheme } from "./input-tags.theme"

export interface RLInputTagsProps extends InputTagsProps {
  children?: JSX.Element
  onAddTag?: (tag: string) => void
  onRemoveTag?: (tag: TagItem) => void
}

const RLInputTags: Component<RLInputTagsProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "items",
    "displayLimit",
    "estimatedTagWidth",
    "showInput",
    "name",
    "placeholder",
    "ui",
    "class",
    "children",
    "onAddTag",
    "onRemoveTag"
  )

  const [inputValue, setInputValue] = createSignal("")
  const limit = () => props.displayLimit ?? 4

  const normalizedItems = createMemo<TagItem[]>(() =>
    (props.items ?? []).map((item) =>
      typeof item === "string" ? { label: item, value: item } : item
    )
  )

  const renderedItems = () => normalizedItems().slice(0, limit())
  const overflowCount = () => Math.max(0, normalizedItems().length - limit())

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const val = inputValue().trim()
      if (val) {
        props.onAddTag?.(val)
        setInputValue("")
      }
    }
  }

  const resolvedClasses = createMemo(() =>
    inputTagsTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      <Show when={normalizedItems().length > 0} fallback={props.children}>
        <For each={renderedItems()}>
          {(item) => (
            <span class={resolvedClasses().tag} data-slot="tag">
              <span class={resolvedClasses().tagLabel}>{item.label}</span>
              <Show when={props.name}>
                <input type="hidden" name={props.name} value={item.value ?? item.label} />
              </Show>
            </span>
          )}
        </For>

        <Show when={overflowCount() > 0}>
          <span class={resolvedClasses().more} data-slot="more" aria-hidden="true">
            +{overflowCount()} more
          </span>
        </Show>
      </Show>

      <Show when={props.showInput}>
        <input
          type="text"
          name={props.name ? `${props.name}__input` : undefined}
          placeholder={props.placeholder || "Add tag…"}
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          class={resolvedClasses().input}
          data-slot="input"
          autocomplete="off"
        />
      </Show>
    </div>
  )
}

export { RLInputTags }
