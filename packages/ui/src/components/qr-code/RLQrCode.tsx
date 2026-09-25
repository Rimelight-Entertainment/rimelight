import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { QrCodeProps } from "./qr-code"
import { qrCodeTheme } from "./qr-code.theme"

export interface RLQrCodeProps extends QrCodeProps {
  children?: JSX.Element
}

const RLQrCode: Component<RLQrCodeProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    qrCodeTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  )
}

export { RLQrCode }
export default RLQrCode
