import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { PricingTableProps } from "./pricing-table"
import { pricingTableTheme } from "./pricing-table.theme"

export interface RLSPricingTableProps extends PricingTableProps {
  children?: JSX.Element
}

const RLSPricingTable: Component<RLSPricingTableProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    pricingTableTheme({
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

export default RLSPricingTable
