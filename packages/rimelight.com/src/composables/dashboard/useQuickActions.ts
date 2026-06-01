import { shallowRef, computed, ref } from "vue"

export interface QuickAction {
  id: string
  label: string
  icon: string
  group?: number
  onSelect: () => void
}

// Module-level globals safe for client-side interactions in Vue Islands
const registeredActionsMap = shallowRef(new Map<string, QuickAction>())
const activeQuickActionIds = ref<string[]>([])

export const useQuickActions = () => {
  const registeredActions = computed(() => {
    return activeQuickActionIds.value
      .map((id) => registeredActionsMap.value.get(id))
      .filter((a): a is QuickAction => !!a)
  })

  function registerAction(action: QuickAction) {
    registeredActionsMap.value.set(action.id, action)
    registeredActionsMap.value = new Map(registeredActionsMap.value)
    if (!activeQuickActionIds.value.includes(action.id)) {
      activeQuickActionIds.value = [...activeQuickActionIds.value, action.id]
    }
  }

  function unregisterAction(id: string) {
    registeredActionsMap.value.delete(id)
    registeredActionsMap.value = new Map(registeredActionsMap.value)
    activeQuickActionIds.value = activeQuickActionIds.value.filter((i) => i !== id)
  }

  return {
    registeredActions,
    registerAction,
    unregisterAction
  }
}
