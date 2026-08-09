import "./styles/cms-editor.css"
import { RimelightEditor } from "./components/rimelight-editor"
import { RimelightPreview } from "./components/rimelight-preview"
import { RimelightBlock } from "./components/rimelight-block"
import { RimelightContentEditable } from "./components/rimelight-contenteditable"
import { RimelightEditorLayout } from "./components/rimelight-editor-layout"
import { RimelightTemplateEditor } from "./components/rimelight-template-editor"

import { ParagraphEditor } from "./components/editors/rimelight-paragraph-editor"
import { ImageEditor } from "./components/editors/rimelight-image-editor"
import { DialogueEditor } from "./components/editors/rimelight-dialogue-editor"
import { CodeEditor } from "./components/editors/rimelight-code-editor"
import { SceneEditor } from "./components/editors/rimelight-scene-editor"
import { RimelightSectionEditor } from "./components/editors/rimelight-section-editor"
import { RimelightCalloutEditor } from "./components/editors/rimelight-callout-editor"
import { RimelightScriptEditor } from "./components/editors/rimelight-script-editor"
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
  if (!customElements.get("rimelight-paragraph-editor")) {
    customElements.define("rimelight-paragraph-editor", ParagraphEditor)
  }
  if (!customElements.get("rimelight-image-editor")) {
    customElements.define("rimelight-image-editor", ImageEditor)
  }
  if (!customElements.get("rimelight-dialogue-editor")) {
    customElements.define("rimelight-dialogue-editor", DialogueEditor)
  }
  if (!customElements.get("rimelight-code-editor")) {
    customElements.define("rimelight-code-editor", CodeEditor)
  }
  if (!customElements.get("rimelight-scene-editor")) {
    customElements.define("rimelight-scene-editor", SceneEditor)
  }
  if (!customElements.get("rimelight-section-editor")) {
    customElements.define("rimelight-section-editor", RimelightSectionEditor)
  }
  if (!customElements.get("rimelight-callout-editor")) {
    customElements.define("rimelight-callout-editor", RimelightCalloutEditor)
  }
  if (!customElements.get("rimelight-script-editor")) {
    customElements.define("rimelight-script-editor", RimelightScriptEditor)
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
  ParagraphEditor,
  ImageEditor,
  DialogueEditor,
  CodeEditor,
  SceneEditor,
  RimelightSectionEditor,
  RimelightCalloutEditor,
  RimelightScriptEditor,
  RimelightBlockPicker
}
