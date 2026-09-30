import { createStore } from "solid-js";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: "success" | "error" | "warning" | "info" | "default";
  duration?: number;
  color?: string;
  icon?: string;
  onDismiss?: () => void;
}

export type Toast = ToastItem;

export const [toasts, setToasts] = createStore<ToastItem[]>([]);

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

export type ToastInput = string | (Omit<ToastItem, "id"> & { id?: string });

function normalizeToastInput(
  input: ToastInput,
  description?: string,
  variant?: ToastItem["variant"],
  extra?: Partial<ToastItem>
): Omit<ToastItem, "id"> & { id?: string } {
  if (typeof input === "string") {
    return {
      title: input,
      ...(description !== undefined ? { description } : {}),
      ...(variant ? { variant } : {}),
      ...extra
    };
  }
  return {
    ...input,
    ...(variant && !input.variant ? { variant } : {}),
    ...extra
  };
}

export const toast = Object.assign(
  (input: ToastInput, description?: string, options?: Partial<ToastItem>) => {
    return addToast(normalizeToastInput(input, description, undefined, options));
  },
  {
    error: (input: ToastInput, description?: string, options?: Partial<ToastItem>) =>
      addToast(normalizeToastInput(input, description, "error", options)),
    success: (input: ToastInput, description?: string, options?: Partial<ToastItem>) =>
      addToast(normalizeToastInput(input, description, "success", options)),
    warning: (input: ToastInput, description?: string, options?: Partial<ToastItem>) =>
      addToast(normalizeToastInput(input, description, "warning", options)),
    info: (input: ToastInput, description?: string, options?: Partial<ToastItem>) =>
      addToast(normalizeToastInput(input, description, "info", options)),
    add: addToast,
    remove: removeToast,
    clear: clearToasts
  }
);

export const showErrorToast = (title: string, description?: string, options?: Partial<ToastItem>) =>
  toast.error(title, description, options);

export const showSuccessToast = (
  title: string,
  description?: string,
  options?: Partial<ToastItem>
) => toast.success(title, description, options);
