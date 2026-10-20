import type { Component } from "solid-js";
import type { RLToasterProps } from "./toaster.types";
import { RLToasterTheme } from "./toaster.theme";
import { For, onSettled } from "solid-js";
import { toasts, removeToast, addToast, type ToastItem } from "../toast/store";
import { RLToast } from "../toast/RLToast";

export const RLToaster: Component<RLToasterProps> = (props) => {
  const { classes, rest } = RLToasterTheme.setup(props);

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
    let toastVariant = url.searchParams.get("toast_variant") || "success";

    if (!toastTitle) {
      if (url.searchParams.has("signed_in")) {
        toastTitle = "Signed in successfully";
      } else if (url.searchParams.has("new")) {
        toastTitle = "Account created successfully";
      }
    }

    if (toastTitle) {
      url.searchParams.delete("toast_title");
      url.searchParams.delete("toast_desc");
      url.searchParams.delete("toast_variant");
      url.searchParams.delete("signed_in");
      url.searchParams.delete("new");
      const cleanUrl = url.pathname + (url.search ? url.search : "");
      window.history.replaceState({}, "", cleanUrl);

      const payload: Record<string, unknown> = { title: toastTitle, variant: toastVariant };
      if (toastDesc) payload["description"] = toastDesc;
      addToast(payload as Omit<ToastItem, "id">);
    }
  });

  return (
    <div
      class={classes().root}
      data-slot="root"
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
            {...(item.variant ? { variant: item.variant } : {})}
            {...(item.duration ? { duration: item.duration } : {})}
            onDismiss={() => removeToast(item.id)}
          />
        )}
      </For>
    </div>
  );
};
