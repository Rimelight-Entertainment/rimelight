import ParagraphBlock from "./ParagraphBlock.astro"
import SectionBlock from "./SectionBlock.astro"
import CalloutBlock from "./CalloutBlock.astro"
import ImageBlock from "./ImageBlock.astro"
import CodeBlock from "./CodeBlock.astro"
import TableBlock from "./TableBlock.astro"
import TabsBlock from "./TabsBlock.astro"
import TabItemBlock from "./TabItemBlock.astro"
import StepsBlock from "./StepsBlock.astro"
import StepItemBlock from "./StepItemBlock.astro"
import CardsBlock from "./CardsBlock.astro"
import CardBlock from "./CardBlock.astro"
import FileTreeBlock from "./FileTreeBlock.astro"
import UnorderedListBlock from "./UnorderedListBlock.astro"
import OrderedListBlock from "./OrderedListBlock.astro"
import ScriptBlock from "./ScriptBlock.astro"
import SceneBlock from "./SceneBlock.astro"
import DialogueBlock from "./DialogueBlock.astro"
import LivePreviewBlock from "./LivePreviewBlock.astro"

export const defaultBlockComponents: Record<string, any> = {
  ParagraphBlock,
  SectionBlock,
  CalloutBlock,
  ImageBlock,
  CodeBlock,
  TableBlock,
  TabsBlock,
  TabItemBlock,
  StepsBlock,
  StepItemBlock,
  CardsBlock,
  CardBlock,
  FileTreeBlock,
  UnorderedListBlock,
  OrderedListBlock,
  ScriptBlock,
  SceneBlock,
  DialogueBlock,
  LivePreviewBlock
}

export default defaultBlockComponents
