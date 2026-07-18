import { atom } from "nanostores"
import type { ThemeColor } from "../themes/theme"

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
    }, toast.timeout || 5000)
  }

  return newToast
}

export function removeToast(id: string | number) {
  const currentToasts = toastsStore.get()
  const idx = currentToasts.findIndex((t) => t.id === id)
  if (idx === -1) return
  const target = currentToasts[idx]!
  if (target.callback) target.callback()
  const next = currentToasts.slice()
  next.splice(idx, 1)
  toastsStore.set(next)
}
