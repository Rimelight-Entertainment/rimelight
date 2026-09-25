import { createMemo, splitProps, type Component } from "solid-js"
import { resolveIcon } from "../../icons"
import type { IconProps } from "./icon"
import { iconTheme } from "./icon.theme"

export interface RLIconProps extends IconProps {}

const RLIcon: Component<RLIconProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["name", "size", "ui", "class"])
  const resolved = createMemo(() => resolveIcon(props.name))
  const classes = createMemo(() =>
    iconTheme({
      size: props.size ?? "md",
      ui: props.ui,
      class: props.class
    })
  )
  return (
    <span class={classes().root} data-slot="icon" aria-hidden="true" {...rest}>
      {resolved().isClass ? (
        <span class={`${resolved().content} block size-full`} />
      ) : (
        <span innerHTML={resolved().content} />
      )}
    </span>
  )
}

export { RLIcon }
export default RLIcon
