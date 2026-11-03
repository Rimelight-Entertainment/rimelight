import type {
  RLCheckboxGroupItem,
  RLCheckboxGroupItemObject,
  RLCheckboxGroupProps,
} from "./checkbox-group.types";
import { RLCheckboxGroupTheme } from "./checkbox-group.theme";
import { createMemo, createSignal, For, omit, Show, type Component } from "solid-js";
import { RLCheckbox } from "../checkbox/RLCheckbox";
import type { RLCheckboxVariant } from "../checkbox/checkbox.types";

const OMIT_KEYS = [
  "id",
  "legend",
  "items",
  "value",
  "defaultValue",
  "indicator",
  "icon",
  "loop",
  "max",
  "name",
  "valueKey",
  "labelKey",
  "descriptionKey",
  "onChange",
  "onValueChange",
] as const;

export const RLCheckboxGroup: Component<RLCheckboxGroupProps> = (props) => {
  const {
    Tag: Root,
    classes,
    rest,
    id,
    slots,
  } = RLCheckboxGroupTheme.setup(props, {
    slots: ["legendSlot", "labelSlot", "descriptionSlot"] as const,
    omit: OMIT_KEYS,
    idPrefix: "rl-checkbox-group",
  });

  const valueKey = () => props.valueKey ?? "value";
  const labelKey = () => props.labelKey ?? "label";
  const descriptionKey = () => props.descriptionKey ?? "description";

  const size = () => props.size ?? "md";
  const color = () => props.color ?? "primary";
  const variant = () => props.variant ?? "list";
  const highlight = () => Boolean(props.highlight);
  const disabled = () => Boolean(props.disabled);

  const [internalValue, setInternalValue] = createSignal<any[]>(
    props.defaultValue ? [...props.defaultValue] : [],
  );

  const selectedValues = (): any[] => {
    if (props.value !== undefined) {
      return Array.isArray(props.value) ? props.value : [];
    }
    return internalValue();
  };

  const isValueSelected = (val: any) => selectedValues().includes(val);

  const isMaxReached = () => {
    if (props.max === undefined || props.max === null) return false;
    return selectedValues().length >= props.max;
  };

  const normalizeItem = (item: RLCheckboxGroupItem, index: number): RLCheckboxGroupItemObject => {
    if (item === null || item === undefined) {
      return {
        id: `${id()}:null:${index}`,
        value: undefined,
        label: undefined,
        description: undefined,
        disabled: undefined,
        icon: undefined,
        class: undefined,
        ui: undefined,
      };
    }
    if (typeof item === "string" || typeof item === "number" || typeof item === "boolean") {
      return {
        id: `${id()}:${item}`,
        value: item,
        label: String(item),
        description: undefined,
        disabled: undefined,
        icon: undefined,
        class: undefined,
        ui: undefined,
      };
    }
    const val = item[valueKey()];
    const lbl = item[labelKey()];
    const desc = item[descriptionKey()];

    return {
      ...item,
      id: item.id || `${id()}:${val ?? index}`,
      value: val,
      label: lbl,
      description: desc,
    };
  };

  const normalizedItems = createMemo(() => {
    if (!props.items) return [];
    return props.items.map((item, index) => normalizeItem(item, index));
  });

  const toggleValue = (itemVal: any, checked: boolean, event: Event) => {
    const current = selectedValues();
    let next: any[];

    if (checked) {
      if (isMaxReached() && !current.includes(itemVal)) {
        return;
      }
      next = current.includes(itemVal) ? current : [...current, itemVal];
    } else {
      next = current.filter((v) => v !== itemVal);
    }

    setInternalValue(next);

    if (props.onValueChange) {
      props.onValueChange(next);
    }
    if (props.onChange) {
      props.onChange(event);
    }
  };

  const renderLegend = () => {
    if (slots.legendSlot() !== undefined) return slots.legendSlot();
    return props.legend;
  };

  return (
    <Root
      id={id()}
      class={classes().root}
      data-slot="root"
      data-theme={props.theme}
      data-disabled={disabled() ? "true" : undefined}
      {...rest}
    >
      <fieldset class={classes().fieldset} data-slot="fieldset">
        <Show when={props.legend || slots.legendSlot()}>
          <legend class={classes().legend} data-slot="legend">
            {renderLegend()}
          </legend>
        </Show>

        <Show when={normalizedItems().length > 0} fallback={props.children}>
          <For each={normalizedItems()}>
            {(item) => {
              const itemSelected = () => isValueSelected(item.value);
              const itemDisabled = () =>
                disabled() || Boolean(item.disabled) || (isMaxReached() && !itemSelected());

              const childUi = () => {
                const baseUi = props.ui ? omit(props.ui, "root", "fieldset", "legend", "item") : {};
                return {
                  ...baseUi,
                  ...item.ui,
                };
              };

              const childVariant = (): RLCheckboxVariant =>
                variant() === "table" ? "list" : (variant() as RLCheckboxVariant);

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
                    variant={childVariant()}
                    indicator={props.indicator}
                    highlight={highlight()}
                    checked={itemSelected()}
                    disabled={itemDisabled()}
                    ui={childUi()}
                    class={item.class}
                    onChange={(e) => toggleValue(item.value, e.currentTarget.checked, e)}
                    labelSlot={
                      slots.labelSlot()
                        ? () => slots.labelSlot()!({ item: item as any })
                        : undefined
                    }
                    descriptionSlot={
                      slots.descriptionSlot()
                        ? () => slots.descriptionSlot()!({ item: item as any })
                        : undefined
                    }
                  />
                </div>
              );
            }}
          </For>
        </Show>
      </fieldset>
    </Root>
  );
};
