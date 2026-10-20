import type { Component } from "solid-js";
import { createSignal, onSettled } from "solid-js";
import type { RLShareProps } from "./share.types";
import { RLButton } from "../button/RLButton";
import { RLButtonTheme } from "../button/button.theme";
import type { RLButtonProps } from "../button/button.types";

export const RLShare: Component<RLShareProps> = (props) => {
  const { rest } = RLButtonTheme.setup(props);
  const buttonProps = props as RLButtonProps;
  const [copied, setCopied] = createSignal(false);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  onSettled(() => {
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  });

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: document.title, url: window.location.href });
      } catch (err) {
        const error = err as { name?: string };
        if (error.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <RLButton
      class={props["class"]}
      color={buttonProps.color ?? "neutral"}
      variant={buttonProps.variant ?? "outline"}
      size={buttonProps.size ?? "sm"}
      block={buttonProps.block}
      rounded={buttonProps.rounded}
      fieldGroup={buttonProps.fieldGroup}
      justify={buttonProps.justify}
      leading={buttonProps.leading}
      trailing={buttonProps.trailing}
      {...(buttonProps.as !== undefined ? { as: buttonProps.as } : {})}
      theme={buttonProps.theme}
      leadingIcon="share"
      label={copied() ? "Link Copied!" : "Share"}
      ui={props["ui"]}
      onClick={handleShare}
      {...rest}
    >
      {buttonProps.children}
    </RLButton>
  );
};
