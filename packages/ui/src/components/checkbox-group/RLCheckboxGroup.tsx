import type {
  RLCheckboxGroupItem,
  RLCheckboxGroupItemObject,
  RLCheckboxGroupProps,
} from "./checkbox-group.types";
import { RLCheckboxGroupTheme } from "./checkbox-group.theme";
import {
  createMemo,
  createSignal,
  createUniqueId,
  For,
  omit,
  Show,
  type Component,
} from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLCheckbox } from "../checkbox/RLCheckbox";
import type { RLCheckboxVariant } from "../checkbox/checkbox.types";

export const RLCheckboxGroup: Component<RLCheckboxGroupProps> = (allProps) => {
  const props = allProps;
  const generatedId = createUniqueId();
  const id = () => props.id || `rl-checkbox-group-${generatedId}`;

  const rest = omit(
    allProps,
    "as",
    "id",
    "legend",
    "items",
    "modelValue",
    "defaultValue",
    "size",
    "variant",
    "orientation",
    "color",
    "highlight",
    "indicator",
    "icon",
    "disabled",
    "loop",
    "max",
    "name",
    "required",
    "valueKey",
    "labelKey",
    "descriptionKey",
    "ui",
    "class",
    "theme",
    "onChange",
    "onUpdate:modelValue",
    "legendSlot",
    "labelSlot",
    "descriptionSlot",
    "children",
  );

  const valueKey = () => props.valueKey ?? "value";
  const labelKey = () => props.labelKey ?? "label";
  const descriptionKey = () => props.descriptionKey ?? "description";

  const size = () => props.size ?? "md";
  const color = () => props.color ?? "primary";
  const variant = () => props.variant ?? "list";
  const orientation = () => props.orientation ?? "vertical";
  const highlight = () => Boolean(props.highlight);
  const disabled = () => Boolean(props.disabled);
  const required = () => Boolean(props.required);

  const [internalValue, setInternalValue] = createSignal<any[]>(
    props.defaultValue ? [...props.defaultValue] : [],
  );

  const selectedValues = (): any[] => {
    if (props.modelValue !== undefined) {
      return Array.isArray(props.modelValue) ? props.modelValue : [];
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

  const resolvedClasses = createMemo(() =>
    RLCheckboxGroupTheme({
      size: size(),
      color: color(),
      variant: variant(),
      orientation: orientation(),
      required: required(),
      highlight: highlight(),
      disabled: disabled(),
      theme: props.theme,
      ui: props.ui,
      class: props.class,
    }),
  );

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

    if (props["onUpdate:modelValue"]) {
      props["onUpdate:modelValue"](next);
    }
    if (props.onChange) {
      props.onChange(event);
    }
  };

  const Root = dynamic(() => props.as ?? "div");

  const renderLegend = () => {
    if (props.legendSlot !== undefined) return props.legendSlot;
    return props.legend;
  };

  return (
    <Root
      id={id()}
      class={resolvedClasses().root}
      data-slot="root"
      data-theme={props.theme}
      data-disabled={disabled() ? "true" : undefined}
      {...rest}
    >
      <fieldset class={resolvedClasses().fieldset} data-slot="fieldset">
        <Show when={props.legend || props.legendSlot}>
          <legend class={resolvedClasses().legend} data-slot="legend">
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
                  class={resolvedClasses().item}
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
                      props.labelSlot ? () => props.labelSlot!({ item: item as any }) : undefined
                    }
                    descriptionSlot={
                      props.descriptionSlot
                        ? () => props.descriptionSlot!({ item: item as any })
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
