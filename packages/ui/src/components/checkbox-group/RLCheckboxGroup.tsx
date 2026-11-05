import type {
  CheckboxGroupItem,
  CheckboxGroupItemValue,
  CheckboxGroupItemObject,
  RLCheckboxGroupProps,
} from "./checkbox-group.types";
import { RLCheckboxGroupTheme } from "./checkbox-group.theme";
import { createMemo, createSignal, For, omit, Show } from "solid-js";
import { RLCheckbox } from "../checkbox/RLCheckbox";
import type { CheckboxLayout } from "../checkbox/checkbox.types";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "id",
  "legend",
  "items",
  "value",
  "defaultValue",
  "icon",
  "side",
  "hasIndicator",
  "disabled",
  "max",
  "name",
  "valueKey",
  "labelKey",
  "descriptionKey",
  "onValueChange",
] as const;

export const RLCheckboxGroup = <T extends CheckboxGroupItem = CheckboxGroupItem>(
  props: RLCheckboxGroupProps<T>,
) => {
  const { Tag, classes, rest, id, slots, children, theme, ui } = RLCheckboxGroupTheme.setup(props, {
    slots: ["legendSlot", "labelSlot", "descriptionSlot"] as const,
    omit: OMIT_KEYS,
  });

  const valueKey = () => props.valueKey ?? "value";
  const labelKey = () => props.labelKey ?? "label";
  const descriptionKey = () => props.descriptionKey ?? "description";

  const size = () => props.size ?? "md";
  const color = () => props.color ?? "primary";
  const highlight = () => Boolean(props.highlight);
  const disabled = () => Boolean(props.disabled);

  // `table` is a group-level preset; its items are plain list checkboxes.
  const childLayout = (): CheckboxLayout | undefined =>
    props.layout === "table" ? "list" : props.layout;

  const [internalValue, setInternalValue] = createSignal<CheckboxGroupItemValue[]>([
    ...(props.defaultValue ?? []),
  ]);

  const selectedValues = () => props.value ?? internalValue();

  const isMaxReached = () => {
    if (props.max === undefined || props.max === null) return false;
    return selectedValues().length >= props.max;
  };

  const normalizeItem = (item: CheckboxGroupItem, index: number): CheckboxGroupItemObject => {
    if (typeof item !== "object") {
      return { id: `${id()}:${item}`, value: item, label: String(item) };
    }
    const rawValue = Reflect.get(item, valueKey());
    const rawLabel = Reflect.get(item, labelKey());
    const rawDescription = Reflect.get(item, descriptionKey());
    const value =
      typeof rawValue === "string" || typeof rawValue === "number" ? rawValue : undefined;

    return {
      ...item,
      id: item.id || `${id()}:${value ?? index}`,
      value,
      label: typeof rawLabel === "string" ? rawLabel : undefined,
      description: typeof rawDescription === "string" ? rawDescription : undefined,
    };
  };

  const normalizedItems = createMemo(() =>
    (props.items ?? []).map((item, index) => normalizeItem(item, index)),
  );

  const childUi = createMemo(() => {
    const groupUi = ui();
    if (!groupUi) return undefined;
    return omit(groupUi, "root", "fieldset", "legend", "item");
  });

  const toggleValue = (itemVal: CheckboxGroupItemValue, checked: boolean) => {
    const current = selectedValues();
    let next: CheckboxGroupItemValue[];

    if (checked) {
      if (isMaxReached() && !current.includes(itemVal)) {
        return;
      }
      next = current.includes(itemVal) ? current : [...current, itemVal];
    } else {
      next = current.filter((v) => v !== itemVal);
    }

    setInternalValue(next);
    props.onValueChange?.(next);
  };

  return (
    <Tag
      id={id()}
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-disabled={disabled() ? "" : undefined}
      {...rest}
    >
      <fieldset class={classes().fieldset} data-slot="fieldset">
        <Show when={props.legend || slots.legendSlot()}>
          <legend class={classes().legend} data-slot="legend">
            <Show when={slots.legendSlot()} fallback={props.legend}>
              {renderSlot(slots.legendSlot())}
            </Show>
          </legend>
        </Show>

        <Show when={normalizedItems().length > 0} fallback={children()}>
          <For each={normalizedItems()}>
            {(item) => {
              const itemSelected = () =>
                item.value !== undefined && selectedValues().includes(item.value);
              const itemDisabled = () =>
                disabled() || Boolean(item.disabled) || (isMaxReached() && !itemSelected());

              return (
                <div
                  class={classes().item}
                  data-slot="item"
                  data-state={itemSelected() ? "checked" : "unchecked"}
                  aria-disabled={itemDisabled() ? "true" : undefined}
                >
                  <RLCheckbox
                    id={item.id}
                    name={props.name}
                    value={item.value}
                    label={item.label}
                    description={item.description}
                    icon={item.icon ?? props.icon}
                    size={size()}
                    color={color()}
                    layout={childLayout()}
                    side={props.side}
                    hasIndicator={props.hasIndicator}
                    highlight={highlight()}
                    checked={itemSelected()}
                    disabled={itemDisabled()}
                    ui={childUi()}
                    class={item.class}
                    onCheckedChange={(checked) => {
                      if (item.value !== undefined) toggleValue(item.value, checked);
                    }}
                    labelSlot={
                      slots.labelSlot() ? () => renderSlot(slots.labelSlot(), { item }) : undefined
                    }
                    descriptionSlot={
                      slots.descriptionSlot()
                        ? () => renderSlot(slots.descriptionSlot(), { item })
                        : undefined
                    }
                  />
                </div>
              );
            }}
          </For>
        </Show>
      </fieldset>
    </Tag>
  );
};
