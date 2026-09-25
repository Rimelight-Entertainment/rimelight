import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { EditorProps } from "./editor"
import { editorTheme } from "./editor.theme"

export interface RLEditorProps extends EditorProps {
  children?: JSX.Element
}

const RLEditor: Component<RLEditorProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children"])

  const resolvedClasses = createMemo(() =>
    editorTheme({
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

export { RLEditor }
export default RLEditor
