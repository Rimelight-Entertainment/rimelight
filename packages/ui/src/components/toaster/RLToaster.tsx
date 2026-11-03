import type { Component } from "solid-js";
import type { RLToasterProps } from "./toaster.types";
import type { ThemeColor } from "../../types";
import { RLToasterTheme } from "./toaster.theme";
import { For, onSettled } from "solid-js";
import { toasts, removeToast, addToast, type ToastItem } from "../toast/store";
import { RLToast } from "../toast/RLToast";
import { uiT } from "../../locale";

export const RLToaster: Component<RLToasterProps> = (props) => {
  const { Tag, classes, rest, theme } = RLToasterTheme.setup(props);

  onSettled(() => {
    const stored = sessionStorage.getItem("pending_toast");
    if (stored) {
      sessionStorage.removeItem("pending_toast");
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.title) {
          addToast(parsed);
        }
      } catch {}
    }

    const url = new URL(window.location.href);
    let toastTitle = url.searchParams.get("toast_title");
    const toastDesc = url.searchParams.get("toast_desc") ?? undefined;
    const toastColor = (url.searchParams.get("toast_color") || "success") as ThemeColor;

    if (!toastTitle) {
      if (url.searchParams.has("signed_in")) {
        toastTitle = uiT("toaster.signed-in");
      } else if (url.searchParams.has("new")) {
        toastTitle = uiT("toaster.account-created");
      }
    }

    if (toastTitle) {
      url.searchParams.delete("toast_title");
      url.searchParams.delete("toast_desc");
      url.searchParams.delete("toast_color");
      url.searchParams.delete("signed_in");
      url.searchParams.delete("new");
      const cleanUrl = url.pathname + (url.search ? url.search : "");
      window.history.replaceState({}, "", cleanUrl);

      const payload: Omit<ToastItem, "id"> = { title: toastTitle, color: toastColor };
      if (toastDesc) payload.description = toastDesc;
      addToast(payload);
    }
  });

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      aria-live="polite"
      aria-atomic="false"
      role="status"
      {...rest}
    >
      <For each={toasts}>
        {(item) => (
          <RLToast
            title={item.title}
            {...(item.description ? { description: item.description } : {})}
            {...(item.color ? { color: item.color } : {})}
            {...(item.duration ? { duration: item.duration } : {})}
            onDismiss={() => removeToast(item.id)}
          />
        )}
      </For>
    </Tag>
  );
};
