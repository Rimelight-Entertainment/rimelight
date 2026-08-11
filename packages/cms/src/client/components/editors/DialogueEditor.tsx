import { onMount, type Component } from "solid-js"

export interface DialogueEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const DialogueEditor: Component<DialogueEditorProps> = (componentProps) => {
  let characterInput: HTMLInputElement | null = null as HTMLInputElement | null
  let parentheticalInput: HTMLInputElement | null = null as HTMLInputElement | null
  let lineTextarea: HTMLTextAreaElement | null = null as HTMLTextAreaElement | null

  const autoResize = () => {
    if (lineTextarea) {
      lineTextarea.style.height = "auto"
      lineTextarea.style.height = `${lineTextarea.scrollHeight}px`
    }
  }

  const saveProps = () => {
    componentProps.onPropsChange({
      ...componentProps.props,
      character: characterInput?.value || "",
      parenthetical: parentheticalInput?.value || "",
      line: lineTextarea?.value || ""
    })
  }

  onMount(() => {
    if (lineTextarea) {
      lineTextarea.value = componentProps.props.line || ""
      autoResize()
    }
  })

  return (
    <div class="rimelight-dialogue-editor flex flex-col gap-2 p-3 border-l-4 border-purple-500 bg-purple-950/10 rounded-r-md w-full">
      <input
        ref={(el) => (characterInput = el)}
        type="text"
        data-field="character"
        value={componentProps.props.character || ""}
        onBlur={saveProps}
        class="text-center uppercase font-bold text-sm text-purple-200 bg-transparent border-b border-purple-800 px-2 py-1 outline-none w-48 mx-auto block placeholder-purple-800"
        placeholder="CHARACTER"
      />
      <input
        ref={(el) => (parentheticalInput = el)}
        type="text"
        data-field="parenthetical"
        value={componentProps.props.parenthetical || ""}
        onBlur={saveProps}
        class="text-center italic text-sm text-gray-400 bg-transparent border-b border-gray-700 px-2 py-1 outline-none w-64 mx-auto block placeholder-gray-600"
        placeholder="(parenthetical)"
      />
      <textarea
        ref={(el) => (lineTextarea = el)}
        data-field="line"
        onInput={autoResize}
        onBlur={saveProps}
        class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100 resize-none outline-none focus:border-purple-500 min-h-[60px]"
        placeholder="Dialogue line..."
      />
    </div>
  )
}
