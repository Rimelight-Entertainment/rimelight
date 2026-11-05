import type { Component } from "solid-js";
import type { RLColorPickerProps } from "./color-picker.types";
import { RLColorPickerTheme } from "./color-picker.theme";
import { createControllable } from "../../controllable";
import { DEFAULT_COLOR_AREA_HEX } from "../../constants/color";
import { uiT } from "../../locale";
import { RLColorArea } from "../color-area/RLColorArea";
import { RLColorField } from "../color-field/RLColorField";
import { RLColorSlider } from "../color-slider/RLColorSlider";

const OMIT_KEYS = ["value", "defaultValue", "onValueChange", "disabled", "aria-label"] as const;

export const RLColorPicker: Component<RLColorPickerProps> = (props) => {
  const [color, setColor] = createControllable<string>(
    () => props.value,
    props.defaultValue ?? DEFAULT_COLOR_AREA_HEX,
    (next) => props.onValueChange?.(next),
  );
  const { Tag, classes, rest, theme } = RLColorPickerTheme.setup(props, { omit: OMIT_KEYS });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      role="group"
      aria-label={props["aria-label"] ?? uiT("color-picker.label")}
      data-disabled={props.disabled ? "" : undefined}
      class={classes().root}
      {...rest}
    >
      <RLColorArea
        class={classes().area}
        value={color()}
        onValueChange={setColor}
        disabled={props.disabled}
      />
      <RLColorSlider
        class={classes().hue}
        channel="hue"
        value={color()}
        onValueChange={setColor}
        disabled={props.disabled}
      />
      <RLColorField
        class={classes().field}
        value={color()}
        onValueChange={setColor}
        disabled={props.disabled}
      />
    </Tag>
  );
};
