import { ref } from "vue"

export interface ToastMessage {
  id?: string
  title: string
  description?: string
  color?: "success" | "warning" | "error" | "info" | "primary" | "secondary"
  timeout?: number
}

const toasts = ref<ToastMessage[]>([])

export const useToast = () => {
  const add = (toast: ToastMessage) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    toasts.value.push(newToast)

    const timeout = toast.timeout ?? 5000
    if (timeout > 0) {
      setTimeout(() => {
        remove(id)
      }, timeout)
    }
    return id
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  return {
    toasts,
    add,
    remove
  }
}
