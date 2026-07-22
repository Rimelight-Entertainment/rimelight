import { atom } from "nanostores"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info" | "default"
}

export const toasts = atom<ToastItem[]>([])

export function addToast(toast: Omit<ToastItem, "id">) {
  const id = Math.random().toString(36).slice(2, 9)
  const item: ToastItem = { id, ...toast }
  toasts.set([...toasts.get(), item])

  setTimeout(() => {
    removeToast(id)
  }, 4500)
}

export function removeToast(id: string) {
  toasts.set(toasts.get().filter((t) => t.id !== id))
}
