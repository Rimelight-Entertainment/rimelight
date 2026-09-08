import { type Component } from "solid-js"
import RLSInput from "@rimelight/ui/components/input/RLSInput.tsx"

export interface CardEditorProps {
  props: Record<string, any>
  onPropsChange: (newProps: Record<string, any>) => void
}

export const CardEditor: Component<CardEditorProps> = (componentProps) => {
  const save = (field: string, value: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      [field]: value
    })
  }

  return (
    <div class="rimelight-card-editor flex flex-col gap-2 p-3 rounded-xl border border-default bg-muted/10 w-full">
      <div class="grid grid-cols-2 gap-2">
        <RLSInput
          type="text"
          placeholder="Card Title"
          value={componentProps.props["title"] || ""}
          onBlur={(e) => save("title", e.currentTarget.value)}
          size="sm"
        />
        <RLSInput
          type="text"
          placeholder="Link (href e.g. /docs/getting-started)"
          value={componentProps.props["href"] || ""}
          onBlur={(e) => save("href", e.currentTarget.value)}
          size="sm"
        />
      </div>
      <RLSInput
        type="text"
        placeholder="Card Description"
        value={componentProps.props["description"] || ""}
        onBlur={(e) => save("description", e.currentTarget.value)}
        size="sm"
      />
      <div class="grid grid-cols-2 gap-2">
        <RLSInput
          type="text"
          placeholder="Icon (e.g. i-lucide-book-open)"
          value={componentProps.props["icon"] || ""}
          onBlur={(e) => save("icon", e.currentTarget.value)}
          size="sm"
        />
        <RLSInput
          type="text"
          placeholder="Badge (optional e.g. New, Beta)"
          value={componentProps.props["badge"] || ""}
          onBlur={(e) => save("badge", e.currentTarget.value)}
          size="sm"
        />
      </div>
    </div>
  )
}
