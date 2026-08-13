import { createMemo, splitProps, type Component } from "solid-js"
import { scv } from "css-variants"
import { useUi } from "../../utils/resolver"
import { resolveClasses } from "../../utils/resolver"
import { resolveIcon } from "./resolver"
import type { IconProps } from "./icon"
import iconThemeDefault from "./icon.theme"

const iconScv = scv(iconThemeDefault)

const RLSIcon: Component<IconProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["name", "size", "ui", "class"])
  const resolved = createMemo(() => resolveIcon(props.name))
  const classes = createMemo(() =>
    resolveClasses(iconScv, { size: props.size ?? "md" }, useUi("icon", props.ui), props.class)
  )
  return (
    <span class={classes().root} data-slot="icon" aria-hidden="true" {...rest}>
      {resolved().isClass ? (
        <span class={resolved().content} />
      ) : (
        <span innerHTML={resolved().content} />
      )}
    </span>
  )
}

export default RLSIcon
