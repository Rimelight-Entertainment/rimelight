import { createSignal, onCleanup, omit, type Component } from "solid-js"
import type { ButtonProps } from "../button/button"
import RLButton from "../button/RLButton"

export interface RLShareProps extends Omit<
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
> {}

const RLShare: Component<RLShareProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "class", "ui")
  const [copied, setCopied] = createSignal(false)
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  onCleanup(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId)
  })

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url: window.location.href })
      } catch (err) {
        const error = err as { name?: string }
        if (error.name !== "AbortError") {
          console.error("Share failed:", err)
        }
      }
      return
    }
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      if (timeoutId !== undefined) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  return (
    <RLButton
      id="rl-share"
      class={props["class"]}
      color="neutral"
      variant="outline"
      size="sm"
      leadingIcon="share"
      label={copied() ? "Link Copied!" : "Share"}
      ui={props["ui"]}
      onClick={handleShare}
      {...rest}
    />
  )
}

export { RLShare }
export default RLShare
