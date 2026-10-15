import type { RLCopyMarkdownProps } from "./copy-markdown.types";
import { createSignal, onCleanup, omit, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";

export const RLCopyMarkdown: Component<RLCopyMarkdownProps> = (props) => {
  const rest = omit(props, "raw", "class", "ui");
  const [copied, setCopied] = createSignal(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.raw);
      setCopied(true);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <RLButton
      class={`rl-copy-markdown ${typeof props.class === "string" ? props.class : ""}`.trim()}
      color="neutral"
      variant="outline"
      size="sm"
      leadingIcon="copy"
      label={copied() ? "Copied!" : "Copy Markdown"}
      data-raw={props.raw}
      ui={props.ui}
      onClick={handleCopy}
      {...rest}
    />
  );
};
