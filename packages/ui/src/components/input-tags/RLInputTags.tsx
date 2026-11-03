import type { RLInputTagsProps, TagItem } from "./input-tags.types";
import { RLInputTagsTheme } from "./input-tags.theme";
import { createMemo, createSignal, For, Show, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "items",
  "displayLimit",
  "showInput",
  "name",
  "placeholder",
  "onAddTag",
] as const;

export const RLInputTags: Component<RLInputTagsProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLInputTagsTheme.setup(props, {
    omit: OMIT_KEYS,
  });

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

  return (
    <Tag data-slot="root" data-theme={theme()} class={classes().root} {...rest}>
      <Show when={normalizedItems().length > 0} fallback={children()}>
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
            {uiT("input-tags.more").replace("{count}", String(overflowCount()))}
          </span>
        </Show>
      </Show>

      <Show when={props.showInput}>
        <input
          type="text"
          name={props.name ? `${props.name}__input` : undefined}
          placeholder={props.placeholder || uiT("input-tags.placeholder")}
          value={inputValue()}
          onInput={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          class={classes().input}
          data-slot="input"
          autocomplete="off"
        />
      </Show>
    </Tag>
  );
};
