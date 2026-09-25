import { createMemo, splitProps, type Component, type JSX } from "solid-js"
import type { AudioProps } from "./audio"
import { audioTheme } from "./audio.theme"

export interface RLAudioProps extends AudioProps {
  children?: JSX.Element
  transcript?: JSX.Element
}

const RLAudio: Component<RLAudioProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["ui", "class", "children", "transcript"])

  const resolvedClasses = createMemo(() => audioTheme({ ui: props.ui, class: props.class }))

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
      {props.transcript !== undefined && (
        <div class="mt-2 text-sm text-zinc-400" data-slot="transcript">
          {props.transcript}
        </div>
      )}
    </div>
  )
}

export { RLAudio }
export default RLAudio
