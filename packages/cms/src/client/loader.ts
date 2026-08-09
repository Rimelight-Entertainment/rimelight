import "./styles/cms-editor.css"
import { RimelightEditor } from "./components/rimelight-editor"
import { RimelightPreview } from "./components/rimelight-preview"
import { RimelightBlock } from "./components/rimelight-block"
import { RimelightContentEditable } from "./components/rimelight-contenteditable"
import { RimelightEditorLayout } from "./components/rimelight-editor-layout"
import { RimelightTemplateEditor } from "./components/rimelight-template-editor"

import ParagraphEditor from "./components/editors/ParagraphEditor.astro"
import ImageEditor from "./components/editors/ImageEditor.astro"
import DialogueEditor from "./components/editors/DialogueEditor.astro"
import CodeEditor from "./components/editors/CodeEditor.astro"
import SceneEditor from "./components/editors/SceneEditor.astro"
import SectionEditor from "./components/editors/SectionEditor.astro"
import CalloutEditor from "./components/editors/CalloutEditor.astro"
import ScriptEditor from "./components/editors/ScriptEditor.astro"

import { RimelightBlockPicker } from "./components/rimelight-block-picker"
import { RimelightPropertiesPanel } from "./components/rimelight-properties-panel"

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
  if (!customElements.get("rimelight-properties-panel")) {
    customElements.define("rimelight-properties-panel", RimelightPropertiesPanel)
  }
  if (!customElements.get("rimelight-block-picker")) {
    customElements.define("rimelight-block-picker", RimelightBlockPicker)
  }
}

export {
  RimelightEditor,
  RimelightPreview,
  RimelightBlock,
  RimelightContentEditable,
  RimelightEditorLayout,
  RimelightTemplateEditor,
  RimelightPropertiesPanel,
  RimelightBlockPicker,
  ParagraphEditor,
  ImageEditor,
  DialogueEditor,
  CodeEditor,
  SceneEditor,
  SectionEditor,
  CalloutEditor,
  ScriptEditor
}
