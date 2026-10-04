import {
  createMemo,
  createSignal,
  omit,
  For,
  Show,
  onSettled,
  createEffect,
  type Component,
} from "solid-js";
import type { InputMenuProps } from "./input-menu";
import { inputMenuTheme } from "./input-menu.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLInputMenuProps extends InputMenuProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

type InputMenuItem = { label: string; value: string; [key: string]: any };

export const RLInputMenu: Component<RLInputMenuProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "items",
    "value",
    "defaultValue",
    "placeholder",
    "disabled",
    "name",
    "label",
    "size",
    "color",
    "ui",
    "class",
    "onValueChange",
  );

  const resolvedClasses = createMemo(() =>
    inputMenuTheme({
      size: props.size ?? "md",
      color: props.color,
      ui: props.ui,
      class: props.class,
    }),
  );

  const normalizedItems = createMemo<InputMenuItem[]>(() =>
    (props.items ?? []).map((item) =>
      typeof item === "string" ? { label: item, value: item } : item,
    ),
  );

  const [selectedValue, setSelectedValue] = createSignal<string>(
    props.value !== undefined
      ? String(props.value)
      : props.defaultValue !== undefined
        ? String(props.defaultValue)
        : "",
  );
  const currentValue = () => (props.value !== undefined ? String(props.value) : selectedValue());

  const selectedItem = createMemo(() =>
    normalizedItems().find((item) => String(item.value) === String(currentValue())),
  );

  const visibleLabel = createMemo(() => {
    if (props.placeholder && (currentValue() === "" || currentValue() === "undefined")) {
      return props.placeholder;
    }
    return selectedItem()?.label ?? props.placeholder ?? "Select item...";
  });

  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");

  let searchRef: HTMLInputElement | undefined;
  let hiddenRef: HTMLInputElement | undefined;

  const filteredItems = createMemo(() => {
    const q = query().toLowerCase().trim();
    if (!q) return normalizedItems();
    return normalizedItems().filter((item) => item.label.toLowerCase().includes(q));
  });

  const selectItem = (value: string, _label: string) => {
    if (props.value === undefined) setSelectedValue(value);
    if (hiddenRef) hiddenRef.value = value;
    props.onValueChange?.(value);
    setQuery("");
    setOpen(false);
  };

  const handleTriggerClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.disabled) return;
    setOpen(!open());
  };

  const handleItemClick = (e: MouseEvent, item: InputMenuItem) => {
    e.stopPropagation();
    selectItem(item.value, item.label);
  };

  createEffect(
    () => open(),
    (isOpen) => {
      if (isOpen) searchRef?.focus();
    },
  );

  onSettled(() => {
    const handleDocumentClick = () => {
      setOpen(false);
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  });

  return (
    <div
      class={resolvedClasses().root}
      data-slot="root"
      data-disabled={props.disabled ? "" : undefined}
      {...rest}
    >
      {props.label ? (
        <label class={resolvedClasses().label} data-slot="label">
          {props.label}
        </label>
      ) : null}

      <div class="relative w-full" data-inputMenu-wrapper>
        <button
          type="button"
          class={resolvedClasses().trigger}
          data-slot="trigger"
          disabled={props.disabled}
          data-inputMenu-trigger
          onClick={handleTriggerClick}
        >
          <span data-inputMenu-value>{visibleLabel()}</span>
          <RLIcon name="i-rl-chevronsUpDown" class="opacity-50" aria-hidden="true" />
        </button>

        <Show when={open()}>
          <div
            class={`${resolvedClasses().content} absolute z-50`}
            data-inputMenu-dropdown
            data-slot="content"
          >
            <input
              type="text"
              class={resolvedClasses().input}
              placeholder="Search..."
              data-inputMenu-search
              ref={(el) => (searchRef = el)}
              onInput={(e) => setQuery(e.currentTarget.value)}
            />
            <div class="py-1" data-inputMenu-items>
              <For each={filteredItems()}>
                {(item) => (
                  <div
                    class={resolvedClasses().item}
                    data-slot="item"
                    data-value={item.value}
                    data-label={item.label}
                    data-inputMenu-item
                    data-state={
                      String(item.value) === String(currentValue()) ? "selected" : undefined
                    }
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <span class={resolvedClasses().itemText}>{item.label}</span>
                    <RLIcon
                      name="i-rl-check"
                      class={`${resolvedClasses().itemIcon} ${
                        String(item.value) === String(currentValue()) ? "" : "hidden"
                      }`}
                      data-check-icon
                      aria-hidden="true"
                    />
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>

      <input
        type="hidden"
        name={props.name}
        value={currentValue()}
        data-inputMenu-hidden-input
        ref={(el) => (hiddenRef = el)}
      />
    </div>
  );
};
