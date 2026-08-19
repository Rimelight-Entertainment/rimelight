import { For, type Component } from "solid-js"
import type { TableColumnDef } from "../../../core/types/blocks"
import RLSInput from "@rimelight/ui/components/input/RLSInput.tsx"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"

export interface TableEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const TableEditor: Component<TableEditorProps> = (componentProps) => {
  const columns = (): TableColumnDef[] =>
    componentProps.props.columns || [
      { key: "col1", header: "Header 1", align: "left" },
      { key: "col2", header: "Header 2", align: "left" }
    ]

  const rows = (): Record<string, string>[] =>
    componentProps.props.rows || [{ col1: "Cell 1", col2: "Cell 2" }]

  const save = (newCols: TableColumnDef[], newRows: Record<string, string>[], caption?: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      columns: newCols,
      rows: newRows,
      caption: caption !== undefined ? caption : componentProps.props.caption || ""
    })
  }

  const addColumn = () => {
    const nextIdx = columns().length + 1
    const key = `col${nextIdx}`
    const newCols = [...columns(), { key, header: `Header ${nextIdx}`, align: "left" as const }]
    const newRows = rows().map((r) => ({ ...r, [key]: "" }))
    save(newCols, newRows)
  }

  const removeColumn = (colIdx: number) => {
    if (columns().length <= 1) return
    const targetKey = columns()[colIdx]!.key
    const newCols = columns().filter((_, i) => i !== colIdx)
    const newRows = rows().map((r) => {
      const next = { ...r }
      delete next[targetKey]
      return next
    })
    save(newCols, newRows)
  }

  const addRow = () => {
    const newRow: Record<string, string> = {}
    for (const col of columns()) {
      newRow[col.key] = ""
    }
    save(columns(), [...rows(), newRow])
  }

  const removeRow = (rowIdx: number) => {
    if (rows().length <= 1) return
    save(
      columns(),
      rows().filter((_, i) => i !== rowIdx)
    )
  }

  const updateHeader = (colIdx: number, val: string) => {
    const newCols = [...columns()]
    newCols[colIdx] = { ...newCols[colIdx]!, header: val }
    save(newCols, rows())
  }

  const updateCell = (rowIdx: number, colKey: string, val: string) => {
    const newRows = [...rows()]
    newRows[rowIdx] = { ...newRows[rowIdx], [colKey]: val }
    save(columns(), newRows)
  }

  return (
    <div class="rimelight-table-editor flex flex-col gap-3 p-3 rounded-xl border border-default/70 w-full overflow-x-auto">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold uppercase tracking-wider text-muted-foreground">Table</span>
        <div class="flex items-center gap-2">
          <RLSButton
            variant="outline"
            color="neutral"
            size="xs"
            onClick={addColumn}
            leadingIcon="plus"
            label="Add Column"
          />
          <RLSButton
            variant="outline"
            color="neutral"
            size="xs"
            onClick={addRow}
            leadingIcon="plus"
            label="Add Row"
          />
        </div>
      </div>

      <div class="overflow-x-auto border border-default rounded-lg">
        <table class="w-full text-xs border-collapse">
          <thead>
            <tr class="bg-muted/30 border-b border-default">
              <For each={columns()}>
                {(col, colIdx) => (
                  <th class="p-1 min-w-[120px] font-medium text-left">
                    <div class="flex items-center gap-1">
                      <input
                        type="text"
                        aria-label={`Column ${colIdx() + 1} header`}
                        class="w-full bg-transparent border border-transparent hover:border-default focus:border-primary rounded px-2 py-1 font-semibold outline-none text-foreground"
                        value={col.header}
                        onBlur={(e) => updateHeader(colIdx(), e.currentTarget.value)}
                      />
                      {columns().length > 1 && (
                        <button
                          type="button"
                          aria-label="Delete column"
                          class="text-muted-foreground hover:text-danger p-1 text-xs"
                          onClick={() => removeColumn(colIdx())}
                          title="Delete column"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </th>
                )}
              </For>
              <th class="w-8 p-1" aria-label="Row actions"></th>
            </tr>
          </thead>
          <tbody>
            <For each={rows()}>
              {(row, rowIdx) => (
                <tr class="border-b border-default/50 hover:bg-muted/20">
                  <For each={columns()}>
                    {(col) => (
                      <td class="p-1">
                        <input
                          type="text"
                          aria-label={`${col.header} row ${rowIdx() + 1}`}
                          class="w-full bg-transparent border border-transparent hover:border-default focus:border-primary rounded px-2 py-1 outline-none text-foreground"
                          value={row[col.key] || ""}
                          onBlur={(e) => updateCell(rowIdx(), col.key, e.currentTarget.value)}
                        />
                      </td>
                    )}
                  </For>
                  <td class="p-1 text-center">
                    {rows().length > 1 && (
                      <button
                        type="button"
                        aria-label="Delete row"
                        class="text-muted-foreground hover:text-danger p-1 text-xs"
                        onClick={() => removeRow(rowIdx())}
                        title="Delete row"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>

      <RLSInput
        type="text"
        placeholder="Table caption (optional)"
        value={componentProps.props.caption || ""}
        onBlur={(e) => save(columns(), rows(), e.currentTarget.value)}
        size="sm"
      />
    </div>
  )
}
