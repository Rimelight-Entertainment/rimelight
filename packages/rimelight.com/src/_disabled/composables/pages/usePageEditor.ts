import { computed, type Ref, shallowRef, watch } from "vue"
import { type Page } from "@/types/pages"

export function usePageEditor(page: Ref<Page>, maxHistorySize: number = 100) {
  const history = shallowRef<string[]>([])
  const future = shallowRef<string[]>([])
  let lastCapturedState = JSON.stringify(page.value)
  let isPaused = false

  const canUndo = computed(() => history.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  const captureSnapshot = () => {
    const currentSnapshot = JSON.stringify(page.value)
    if (currentSnapshot === lastCapturedState) return

    future.value = []
    const newHistory = [...history.value, lastCapturedState]
    if (newHistory.length > maxHistorySize) newHistory.shift()
    history.value = newHistory

    lastCapturedState = currentSnapshot
  }

  const undo = () => {
    if (history.value.length === 0) return

    const currentState = JSON.stringify(page.value)
    future.value = [currentState, ...future.value]

    const previousStateString = history.value[history.value.length - 1]!
    lastCapturedState = previousStateString

    page.value = JSON.parse(previousStateString)

    const newHistory = [...history.value]
    newHistory.pop()
    history.value = newHistory
  }

  const redo = () => {
    if (future.value.length === 0) return

    const currentState = JSON.stringify(page.value)
    history.value = [...history.value, currentState]
    lastCapturedState = currentState

    const nextStateString = future.value[0]!
    page.value = JSON.parse(nextStateString)
    lastCapturedState = nextStateString

    const newFuture = [...future.value]
    newFuture.shift()
    future.value = newFuture
  }

  const save = () => {
    return JSON.parse(JSON.stringify(page.value))
  }

  const pauseHistory = () => {
    console.log("[usePageEditor] History paused")
    isPaused = true
  }

  const resumeHistory = () => {
    console.log("[usePageEditor] History resumed")
    isPaused = false
  }

  const resetHistory = () => {
    history.value = []
    future.value = []
    lastCapturedState = JSON.stringify(page.value)
  }

  watch(
    [() => page.value.properties, () => page.value.title, () => page.value.blocks],
    () => {
      if (isPaused) {
        console.log("[usePageEditor] Skipping auto-snapshot - history is paused")
        return
      }
      captureSnapshot()
    },
    { deep: true }
  )

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    save,
    captureSnapshot,
    resetHistory,
    pauseHistory,
    resumeHistory
  }
}
