import { Show, type Component } from "solid-js"
import type { BlockViewProps } from "./ParagraphBlock.tsx"

export const SceneBlock: Component<BlockViewProps> = (props) => {
  const location = () => (props.block.props?.["location"] as string) ?? "LOCATION"
  const timeOfDay = () => (props.block.props?.["timeOfDay"] as string) ?? "DAY"
  const setting = () => (props.block.props?.["setting"] as string) ?? "INT."
  const transition = () => (props.block.props?.["transition"] as string) ?? "CUT TO:"
  const description = () => (props.block.props?.["description"] as string) ?? ""

  return (
    <div class="cms-scene-block my-6 font-mono text-sm" data-block-id={props.block.id}>
      <Show when={transition()}>
        <div class="text-right text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
          {transition()}
        </div>
      </Show>

      <div class="bg-neutral-100 dark:bg-neutral-800/80 px-4 py-2.5 rounded-lg border-l-4 border-primary-500 font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100 mb-3">
        {setting()} {location()} - {timeOfDay()}
      </div>

      <Show when={description()}>
        <p class="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-4 pl-4 border-l-2 border-transparent">
          {description()}
        </p>
      </Show>

      <div class="scene-content pl-4 space-y-3">{props.children}</div>
    </div>
  )
}

export default SceneBlock
