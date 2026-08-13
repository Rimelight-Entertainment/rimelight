import { atom } from "nanostores"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: "success" | "error" | "warning" | "info" | "default"
  duration?: number
  color?: string
  icon?: string
  onDismiss?: () => void
}

export const toasts = atom<ToastItem[]>([])

export function addToast(toast: Omit<ToastItem, "id"> & { id?: string }): ToastItem {
  const id = toast.id || Math.random().toString(36).slice(2, 9)
  const item: ToastItem = { duration: 6000, ...toast, id }
  toasts.set([...toasts.get(), item])
  return item
}

export function removeToast(id: string) {
  const current = toasts.get()
  const target = current.find((t) => t.id === id)
  if (target?.onDismiss) {
    try {
      target.onDismiss()
    } catch (err) {
      console.error("Error executing toast onDismiss callback:", err)
    }
  }
  toasts.set(current.filter((t) => t.id !== id))
}
