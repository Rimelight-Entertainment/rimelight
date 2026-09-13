import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { EditorProps } from "./editor"
import { editorTheme } from "./editor.theme"

export interface RLSEditorProps extends EditorProps {
  children?: JSX.Element
}

const RLSEditor: Component<RLSEditorProps> = (allProps) => {
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

export default RLSEditor
