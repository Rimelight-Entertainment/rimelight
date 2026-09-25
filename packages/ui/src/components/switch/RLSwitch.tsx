import { createMemo, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { SwitchProps } from "./switch"
import { switchTheme } from "./switch.theme"

export interface RLSwitchProps extends SwitchProps {
  children?: JSX.Element
}

const RLSwitch: Component<RLSwitchProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing",
    "theme"
  )

  const resolvedClasses = createMemo(() =>
    switchTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <label class={resolvedClasses().root} data-slot="root" data-theme={props.theme} {...rest}>
      <input
        type="checkbox"
        class={resolvedClasses().input}
        checked={!!props.checked}
        disabled={props.disabled}
        name={props.name}
      />
      <div class={resolvedClasses().track} data-slot="track">
        <div class={resolvedClasses().thumb} data-slot="thumb" />
      </div>
      {props.label !== undefined && props.label !== null ? (
        <span class={resolvedClasses().label} data-slot="label">
          {props.label}
        </span>
      ) : props.children ? (
        <span class={resolvedClasses().label} data-slot="label">
          {props.children}
        </span>
      ) : null}
    </label>
  )
}

export { RLSwitch }
export default RLSwitch
