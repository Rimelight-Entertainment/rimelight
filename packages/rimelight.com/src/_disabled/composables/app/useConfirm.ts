import { ref, watch } from "vue"

export interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean
}

interface ConfirmState {
  isVisible: boolean
  options: ConfirmOptions
}

// Module-level variable to hold the promise resolver and state.
// This is shared globally for client-side interactions.
let resolvePromise: ((value: boolean) => void) | null = null

const state = ref<ConfirmState>({
  isVisible: false,
  options: {
    title: "Confirm Action",
    description: "",
    confirmLabel: "Confirm",
    cancelLabel: "Cancel",
    danger: false
  }
})

export const useConfirm = () => {
  const confirm = (opts: Partial<ConfirmOptions>): Promise<boolean> => {
    state.value.options = {
      title: "Confirm Action",
      confirmLabel: "Confirm",
      cancelLabel: "Cancel",
      danger: false,
      ...opts
    }

    // Open the modal
    state.value.isVisible = true

    return new Promise((resolve) => {
      // If there was a lingering promise, resolve it false first
      if (resolvePromise) resolvePromise(false)
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    if (resolvePromise) {
      resolvePromise(true)
      resolvePromise = null
    }
    state.value.isVisible = false
  }

  const handleCancel = () => {
    state.value.isVisible = false
  }

  // Watchers
  if (typeof window !== "undefined") {
    watch(
      () => state.value.isVisible,
      (visible) => {
        // If it becomes hidden and the promise still exists,
        // it means the user dismissed it without clicking a button.
        if (!visible && resolvePromise) {
          resolvePromise(false)
          resolvePromise = null
        }
      }
    )
  }

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel
  }
}
