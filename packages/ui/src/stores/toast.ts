import { atom } from "nanostores"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info" | "default"
  duration?: number
  color?: string
  icon?: string
}

export const toasts = atom<ToastItem[]>([])

export function addToast(toast: Omit<ToastItem, "id"> & { id?: string }): ToastItem {
  const id = toast.id || Math.random().toString(36).slice(2, 9)
  const item: ToastItem = { duration: 6000, ...toast, id }
  toasts.set([...toasts.get(), item])
  return item
}

export function removeToast(id: string) {
  toasts.set(toasts.get().filter((t) => t.id !== id))
}
