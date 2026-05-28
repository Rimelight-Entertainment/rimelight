import { reactive } from "vue"
import type { ThemeColor } from "../types"

export interface Toast {
  id?: string | number
  title?: string
  description?: string
  icon?: string
  color?: ThemeColor
  timeout?: number
  callback?: () => void
}

const toasts = reactive<Toast[]>([])

export function useToast() {
  const add = (toast: Toast) => {
    const id = toast.id || Date.now()
    const newToast = { ...toast, id }
    toasts.push(newToast)

    if (toast.timeout !== 0) {
      setTimeout(() => {
        remove(id)
      }, toast.timeout || 5000)
    }

    return newToast
  }

  const remove = (id: string | number) => {
    const index = toasts.findIndex((t) => t.id === id)
    if (index !== -1) {
      toasts.splice(index, 1)
    }
  }

  return {
    toasts,
    add,
    remove
  }
}
