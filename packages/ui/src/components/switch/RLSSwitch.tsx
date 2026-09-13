import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { SwitchProps } from "./switch"
import { switchTheme } from "./switch.theme"

export interface RLSSwitchProps extends SwitchProps {
  children?: JSX.Element
}

const RLSSwitch: Component<RLSSwitchProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "ui",
    "class",
    "children",
    "checked",
    "disabled",
    "name",
    "label",
    "value",
    "trailing"
  ])

  const resolvedClasses = createMemo(() =>
    switchTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  )

  return (
    <label class={resolvedClasses().root} data-slot="root" {...rest}>
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

export default RLSSwitch
