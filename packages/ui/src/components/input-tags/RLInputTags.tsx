import type { RLInputTagsProps, TagItem } from "./input-tags.types";
import { RLInputTagsTheme } from "./input-tags.theme";
import { createMemo, createSignal, For, Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";

export const RLInputTags: Component<RLInputTagsProps> = (props) => {
  const rest = omit(
    props,
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
    "onRemoveTag",
  );

  const [inputValue, setInputValue] = createSignal("");
  const limit = () => props.displayLimit ?? 4;

  const normalizedItems = createMemo<TagItem[]>(() =>
    (props.items ?? []).map((item) =>
      typeof item === "string" ? { label: item, value: item } : item,
    ),
  );

  const renderedItems = () => normalizedItems().slice(0, limit());
  const overflowCount = () => Math.max(0, normalizedItems().length - limit());

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = inputValue().trim();
      if (val) {
        props.onAddTag?.(val);
        setInputValue("");
      }
    }
  };

  const classes = createMemo(() =>
    RLInputTagsTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes().root} data-slot="root" {...rest}>
      <Show when={normalizedItems().length > 0} fallback={props.children}>
        <For each={renderedItems()}>
          {(item) => (
            <span class={classes().tag} data-slot="tag">
              <span class={classes().tagLabel}>{item.label}</span>
              <Show when={props.name}>
                <input type="hidden" name={props.name} value={item.value ?? item.label} />
              </Show>
            </span>
          )}
        </For>

        <Show when={overflowCount() > 0}>
          <span class={classes().more} data-slot="more" aria-hidden="true">
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
          class={classes().input}
          data-slot="input"
          autocomplete="off"
        />
      </Show>
    </div>
  );
};
