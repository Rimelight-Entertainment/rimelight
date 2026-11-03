import type { Component } from "solid-js";
import { createSignal, onSettled } from "solid-js";
import type { RLShareProps } from "./share.types";
import { RLShareTheme } from "./share.theme";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";

/**
 * Share button. Uses the Web Share API when available, otherwise copies the current link.
 * `@status stable`
 */
export const RLShare: Component<RLShareProps> = (props) => {
  const { Tag, classes, rest, theme, ui, children } = RLShareTheme.setup(props, {
    as: () => RLButton,
  });
  const [copied, setCopied] = createSignal(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  onSettled(() => {
    return () => {
      clearTimeout(timeoutId);
    };
  });

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch (err) {
        if (!(err instanceof Error && err.name === "AbortError")) {
          console.error("Share failed:", err);
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      color="neutral"
      variant="outline"
      size="sm"
      {...rest}
      class={classes().root}
      theme={theme()}
      ui={ui()}
      leadingIcon="share"
      label={copied() ? uiT("share.copied") : uiT("share.label")}
      onClick={handleShare}
    >
      {children()}
    </Tag>
  );
};
