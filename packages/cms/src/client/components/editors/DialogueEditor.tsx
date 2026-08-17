import { type Component } from "solid-js"
import RLSInput from "@rimelight/ui/components/input/RLSInput"
import RLSTextarea from "@rimelight/ui/components/textarea/RLSTextarea"

export interface DialogueEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const DialogueEditor: Component<DialogueEditorProps> = (componentProps) => {
  const saveProps = (character?: string, parenthetical?: string, line?: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      character: character !== undefined ? character : componentProps.props.character || "",
      parenthetical:
        parenthetical !== undefined ? parenthetical : componentProps.props.parenthetical || "",
      line: line !== undefined ? line : componentProps.props.line || ""
    })
  }

  return (
    <div class="rimelight-dialogue-editor flex flex-col gap-2 p-2 border-l-2 border-primary/50 w-full">
      <div class="w-48 mx-auto">
        <RLSInput
          data-field="character"
          value={componentProps.props.character || ""}
          onBlur={(e) => saveProps(e.currentTarget.value)}
          class="text-center font-bold text-sm uppercase"
          placeholder="CHARACTER"
          size="sm"
        />
      </div>
      <div class="w-64 mx-auto">
        <RLSInput
          data-field="parenthetical"
          value={componentProps.props.parenthetical || ""}
          onBlur={(e) => saveProps(undefined, e.currentTarget.value)}
          class="text-center italic text-sm"
          placeholder="(parenthetical)"
          size="sm"
        />
      </div>
      <RLSTextarea
        data-field="line"
        value={componentProps.props.line || ""}
        onBlur={(e) => saveProps(undefined, undefined, e.currentTarget.value)}
        placeholder="Dialogue line..."
        rows={2}
      />
    </div>
  )
}
