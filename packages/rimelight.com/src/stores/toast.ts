import { writable } from "svelte/store"

export type Toast = {
  id: string
  title: string
  description?: string
  variant: "success" | "error" | "info"
}

function createToastStore() {
  const { subscribe, update } = writable<Toast[]>([])

  return {
    subscribe,
    addToast: (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2)
      update((toasts) => [...toasts, { ...toast, id }])
    },
    removeToast: (id: string) => {
      update((toasts) => toasts.filter((t) => t.id !== id))
    }
  }
}

export const toasts = createToastStore()
export const removeToast = toasts.removeToast
export const addToast = toasts.addToast
