import { ref } from "vue"
import { actions } from "astro:actions"

const noteRefreshTrigger = ref(0)
const selectedIds = ref<string[]>([])
const status = ref<"idle" | "loading" | "success" | "error">("idle")
const error = ref<Error | null>(null)

export const useNotes = () => {
  const triggerRefresh = () => {
    noteRefreshTrigger.value++
  }

  const toggleSelection = (id: string) => {
    if (selectedIds.value.includes(id)) {
      selectedIds.value = selectedIds.value.filter((i: string) => i !== id)
    } else {
      selectedIds.value.push(id)
    }
  }

  const clearSelection = () => {
    selectedIds.value = []
  }

  const wrapApi = async (fn: () => Promise<any>) => {
    status.value = "loading"
    error.value = null
    try {
      await fn()
      status.value = "success"
      triggerRefresh()
    } catch (e) {
      status.value = "error"
      error.value = e instanceof Error ? e : new Error(String(e))
    }
  }

  const executeBatchAction = async (action: "delete" | "archive" | "restore" | "hard-delete") => {
    if (selectedIds.value.length === 0) return
    await wrapApi(async () => {
      const { error: err } = await actions.notes.batchAction({ ids: selectedIds.value, action })
      if (err) throw new Error(err.message)
    })
    clearSelection()
  }

  const executeSingleAction = async (
    id: string,
    action: "togglePin" | "archive" | "restore" | "delete" | "hard-delete"
  ) => {
    await wrapApi(async () => {
      if (action === "togglePin") {
        const { error: err } = await actions.notes.updateNote({ id, isPinned: true }) // toggle pin wrapper
        if (err) throw new Error(err.message)
      } else if (action === "archive") {
        const { error: err } = await actions.notes.updateNote({
          id,
          isArchived: true,
          isPinned: false
        })
        if (err) throw new Error(err.message)
      } else if (action === "restore") {
        const { error: err } = await actions.notes.updateNote({ id, isArchived: false })
        if (err) throw new Error(err.message)
      } else if (action === "delete") {
        const { error: err } = await actions.notes.deleteNote({ id })
        if (err) throw new Error(err.message)
      } else if (action === "hard-delete") {
        const { error: err } = await actions.notes.deleteNote({ id, permanent: true })
        if (err) throw new Error(err.message)
      }
    })
  }

  return {
    noteRefreshTrigger,
    status,
    error,
    triggerRefresh,
    selectedIds,
    toggleSelection,
    clearSelection,
    executeBatchAction,
    executeSingleAction
  }
}
