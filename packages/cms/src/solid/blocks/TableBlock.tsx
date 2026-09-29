import { type Component } from "solid-js"
import { RLTable } from "@rimelight/ui/components/table/RLTable.tsx"
import type { TableColumn } from "@rimelight/ui/components/table/RLTable.tsx"
import type { BlockViewProps } from "./ParagraphBlock.tsx"

export const TableBlock: Component<BlockViewProps> = (props) => {
  const columns = () => (props.block.props?.["columns"] as any[]) ?? []
  const rows = () => (props.block.props?.["rows"] as Record<string, string>[]) ?? []
  const caption = () => props.block.props?.["caption"] as string | undefined
  const striped = () => (props.block.props?.["striped"] as boolean) ?? true
  const bordered = () => (props.block.props?.["bordered"] as boolean) ?? false
  const hoverable = () => (props.block.props?.["hoverable"] as boolean) ?? true

  const resolvedColumns = (): TableColumn[] =>
    columns().map((col: any): TableColumn => {
      const key = typeof col === "string" ? col : (col.key ?? col.id)
      const header = typeof col === "string" ? col : (col.header ?? key)
      const align = typeof col === "object" ? col.align : undefined
      const alignClass =
        align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
      return {
        accessorKey: key,
        header,
        ...(align ? { meta: { class: { th: alignClass, td: alignClass } } } : {})
      }
    })

  return (
    <div class="cms-table my-6" data-block-id={props.block.id}>
      <RLTable
        data={rows()}
        columns={resolvedColumns()}
        caption={caption()}
        striped={striped()}
        bordered={bordered()}
        hoverable={hoverable()}
      />
    </div>
  )
}

export default TableBlock
