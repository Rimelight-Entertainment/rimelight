import { RimelightEditor } from "./components/rimelight-editor"
import { RimelightPreview } from "./components/rimelight-preview"
import { RimelightBlock } from "./components/rimelight-block"
import { RimelightContentEditable } from "./components/rimelight-contenteditable"
import { RimelightEditorLayout } from "./components/rimelight-editor-layout"
import { RimelightTemplateEditor } from "./components/rimelight-template-editor"

export function defineCustomElements() {
  if (!customElements.get("rimelight-editor")) {
    customElements.define("rimelight-editor", RimelightEditor)
  }
  if (!customElements.get("rimelight-preview")) {
    customElements.define("rimelight-preview", RimelightPreview)
  }
  if (!customElements.get("rimelight-block")) {
    customElements.define("rimelight-block", RimelightBlock)
  }
  if (!customElements.get("rimelight-contenteditable")) {
    customElements.define("rimelight-contenteditable", RimelightContentEditable)
  }
  if (!customElements.get("rimelight-editor-layout")) {
    customElements.define("rimelight-editor-layout", RimelightEditorLayout)
  }
  if (!customElements.get("rimelight-template-editor")) {
    customElements.define("rimelight-template-editor", RimelightTemplateEditor)
  }
}

export {
  RimelightEditor,
  RimelightPreview,
  RimelightBlock,
  RimelightContentEditable,
  RimelightEditorLayout,
  RimelightTemplateEditor
}
