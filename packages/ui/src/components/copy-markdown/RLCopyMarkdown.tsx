import type { Component } from "solid-js";
import { createSignal, onSettled } from "solid-js";
import type { RLCopyMarkdownProps } from "./copy-markdown.types";
import { RLButton } from "../button/RLButton";
import { RLButtonTheme } from "../button/button.theme";

const OMIT_KEYS = ["raw"] as const;

export const RLCopyMarkdown: Component<RLCopyMarkdownProps> = (props) => {
  const { rest } = RLButtonTheme.setup(props, { omit: OMIT_KEYS });
  const [copied, setCopied] = createSignal(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  onSettled(() => {
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
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
      color={props.color ?? "neutral"}
      variant={props.variant ?? "outline"}
      size={props.size ?? "sm"}
      block={props.block}
      rounded={props.rounded}
      fieldGroup={props.fieldGroup}
      justify={props.justify}
      leading={props.leading}
      trailing={props.trailing}
      {...(props.as !== undefined ? { as: props.as } : {})}
      theme={props.theme}
      leadingIcon="copy"
      label={copied() ? "Copied!" : "Copy Markdown"}
      data-raw={props.raw}
      ui={props.ui}
      onClick={handleCopy}
      {...rest}
    >
      {props.children}
    </RLButton>
  );
};
