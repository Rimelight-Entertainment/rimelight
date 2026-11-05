import type { InputMenuItem, RLInputMenuProps } from "./input-menu.types";
import { RLInputMenuTheme } from "./input-menu.theme";
import {
  createMemo,
  createSignal,
  For,
  Show,
  onSettled,
  createEffect,
  type Component,
} from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { RLLabel } from "../label/RLLabel";
import { RLButton } from "../button/RLButton";
import { createControllable } from "../../controllable";
import { uiT } from "../../locale";

const OMIT_KEYS = [
  "items",
  "value",
  "defaultValue",
  "onValueChange",
  "placeholder",
  "disabled",
  "name",
  "label",
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
] as const;

export const RLInputMenu: Component<RLInputMenuProps> = (props) => {
  const { Tag, classes, rest, children, theme, id } = RLInputMenuTheme.setup(props, {
    omit: OMIT_KEYS,
    idPrefix: "rl-input-menu",
  });

  const disabledFlag = () => (props.disabled ? "" : undefined);

  const normalizedItems = createMemo<InputMenuItem[]>(() =>
    (props.items ?? []).map((item) =>
      typeof item === "string" ? { label: item, value: item } : item,
    ),
  );

  const [currentValue, setCurrentValue] = createControllable<string>(
    () => props.value,
    props.defaultValue ?? "",
    (next) => props.onValueChange?.(next),
  );

  const selectedItem = createMemo(() =>
    normalizedItems().find((item) => item.value === currentValue()),
  );

  const visibleLabel = createMemo(() => {
    if (props.placeholder && (currentValue() === "" || currentValue() === "undefined")) {
      return props.placeholder;
    }
    return selectedItem()?.label ?? props.placeholder ?? uiT("input-menu.placeholder");
  });

  const [open, setOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");

  let searchRef: HTMLInputElement | undefined;

  const filteredItems = createMemo(() => {
    const q = query().toLowerCase().trim();
    if (!q) return normalizedItems();
    return normalizedItems().filter((item) => item.label.toLowerCase().includes(q));
  });

  const selectItem = (value: string) => {
    setCurrentValue(value);
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
    selectItem(item.value);
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
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      data-disabled={disabledFlag()}
      {...rest}
    >
      <Show when={props.label}>
        <RLLabel for={id()} class={classes().label} data-slot="label">
          {props.label}
        </RLLabel>
      </Show>

      <div class={classes().wrapper} data-slot="wrapper" data-input-menu-wrapper>
        <RLButton
          id={id()}
          variant="outline"
          color="neutral"
          class={classes().trigger}
          data-slot="trigger"
          data-input-menu-trigger
          disabled={props.disabled}
          aria-label={props["aria-label"]}
          aria-labelledby={props["aria-labelledby"]}
          aria-describedby={props["aria-describedby"]}
          aria-haspopup="listbox"
          aria-expanded={open() ? "true" : "false"}
          onClick={handleTriggerClick}
        >
          <span data-input-menu-value>{visibleLabel()}</span>
          <RLIcon
            name="chevrons-up-down"
            class={classes().triggerIcon}
            data-slot="trigger-icon"
            aria-hidden="true"
          />
        </RLButton>

        <Show when={open()}>
          <div class={classes().content} data-input-menu-dropdown data-slot="content">
            <input
              type="text"
              class={classes().input}
              placeholder={uiT("search.placeholder")}
              data-input-menu-search
              ref={(el) => (searchRef = el)}
              onInput={(e) => setQuery(e.currentTarget.value)}
            />
            <div class={classes().items} role="listbox" data-slot="items" data-input-menu-items>
              <For each={filteredItems()}>
                {(item) => (
                  <div
                    class={classes().item}
                    role="option"
                    aria-selected={item.value === currentValue() ? "true" : "false"}
                    data-slot="item"
                    data-value={item.value}
                    data-label={item.label}
                    data-input-menu-item
                    onClick={(e) => handleItemClick(e, item)}
                  >
                    <span class={classes().itemText} data-slot="item-text">
                      {item.label}
                    </span>
                    <Show when={item.value === currentValue()}>
                      <RLIcon
                        name="check"
                        class={classes().itemIcon}
                        data-slot="item-icon"
                        aria-hidden="true"
                      />
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </div>

      <input type="hidden" name={props.name} value={currentValue()} data-input-menu-hidden-input />
      {children()}
    </Tag>
  );
};
