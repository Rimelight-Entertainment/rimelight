import { createSignal, onCleanup, splitProps, type Component } from "solid-js"
import type { ButtonProps } from "../button/button"
import RLSButton from "../button/RLSButton"

export interface RLSCopyMarkdownProps extends Omit<
  ButtonProps,
  | "href"
  | "label"
  | "leadingIcon"
  | "trailingIcon"
  | "loading"
  | "loadingAuto"
  | "square"
  | "active"
  | "activeColor"
  | "activeVariant"
> {
  raw: string
}

const RLSCopyMarkdown: Component<RLSCopyMarkdownProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, ["raw", "class", "ui"])
  const [copied, setCopied] = createSignal(false)
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  onCleanup(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.raw)
      setCopied(true)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  return (
    <RLSButton
      class={`rl-copy-markdown ${typeof props.class === "string" ? props.class : ""}`.trim()}
      color="neutral"
      variant="outline"
      size="sm"
      leadingIcon="copy"
      label={copied() ? "Copied!" : "Copy Markdown"}
      ui={props.ui}
      onClick={handleCopy}
      {...rest}
    />
  )
}

export default RLSCopyMarkdown
