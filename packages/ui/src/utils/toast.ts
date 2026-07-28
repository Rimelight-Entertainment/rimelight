import { atom } from "nanostores"
import type { ThemeColor } from "../types/component"

export interface Toast {
  id?: string | number
  title?: string
  description?: string
  icon?: string
  color?: ThemeColor
  timeout?: number
  callback?: () => void
}

export const toastsStore = atom<Toast[]>([])

export function addToast(toast: Toast) {
  const id = toast.id || Date.now()
  const newToast = { ...toast, id }
  toastsStore.set([...toastsStore.get(), newToast])

  if (toast.timeout !== 0) {
    setTimeout(() => {
      removeToast(id)
    }, toast.timeout || 6000)
  }

  return newToast
}

export function removeToast(id: string | number) {
  const currentToasts = toastsStore.get()
  const target = currentToasts.find((t) => t.id === id)
  if (!target) return
  if (target.callback) target.callback()
  toastsStore.set(currentToasts.filter((t) => t.id !== id))
}
