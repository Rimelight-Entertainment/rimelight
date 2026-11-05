import { createStore } from "solid-js";
import type { ToastItem } from "./toast.types";
export type { ToastItem };

const [toastStore, setToasts] = createStore<ToastItem[]>([]);

export const toasts = toastStore;

export function addToast(toast: Omit<ToastItem, "id"> & { id?: string }): ToastItem {
  const id =
    toast.id ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9));
  const item: ToastItem = { duration: 6000, ...toast, id };
  setToasts((prev) => [...prev, item]);
  return item;
}

export function removeToast(id: string) {
  const target = toasts.find((t) => t.id === id);
  const cb = target?.onDismiss;
  // Remove first so re-entrant calls can't fire onDismiss twice.
  setToasts((prev) => prev.filter((t) => t.id !== id));
  if (cb) {
    try {
      cb();
    } catch (err) {
      console.error("Error executing toast onDismiss callback:", err);
    }
  }
}

export function clearToasts() {
  setToasts(() => []);
}
