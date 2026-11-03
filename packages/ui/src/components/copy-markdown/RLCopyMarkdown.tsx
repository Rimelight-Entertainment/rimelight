import type { Component } from "solid-js";
import { createSignal, onSettled } from "solid-js";
import type { RLCopyMarkdownProps } from "./copy-markdown.types";
import { RLCopyMarkdownTheme } from "./copy-markdown.theme";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";

const OMIT_KEYS = ["raw", "onClick"] as const;

export const RLCopyMarkdown: Component<RLCopyMarkdownProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLCopyMarkdownTheme.setup(props, {
    as: "button",
    omit: OMIT_KEYS,
    slots: ["leadingSlot", "trailingSlot"] as const,
  });
  const [copied, setCopied] = createSignal(false);
  let timeoutId: number | undefined;

  onSettled(() => {
    return () => {
      window.clearTimeout(timeoutId);
    };
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(props.raw);
      setCopied(true);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClick = async (event: MouseEvent) => {
    await handleCopy();
    props.onClick?.(event);
  };

  return (
    <RLButton
      class={classes().root}
      theme={theme()}
      as={Tag}
      leadingIcon="copy"
      label={copied() ? uiT("copy-markdown.copied") : uiT("copy-markdown.copy")}
      leadingSlot={slots.leadingSlot()}
      trailingSlot={slots.trailingSlot()}
      data-raw={props.raw}
      onClick={handleClick}
      {...rest}
    >
      {children()}
    </RLButton>
  );
};
