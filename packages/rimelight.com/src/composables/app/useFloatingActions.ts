import { type Component, shallowRef, computed, ref } from "vue";

export interface FloatingAction {
  id: string;
  label?: string;
  icon?: string;
  component?: Component;
  onSelect?: () => void;
  priority?: number;
}

// Module-level globals safe for client-side interactions in Vue Islands
const registeredActionsMap = shallowRef(new Map<string, FloatingAction>());
const activeActionIds = ref<string[]>([]);

export const useFloatingActions = () => {
  const actions = computed(() => {
    return activeActionIds.value
      .map((id) => registeredActionsMap.value.get(id))
      .filter((a): a is FloatingAction => !!a)
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
  });

  function registerAction(action: FloatingAction) {
    registeredActionsMap.value.set(action.id, action);
    registeredActionsMap.value = new Map(registeredActionsMap.value);
    if (!activeActionIds.value.includes(action.id)) {
      activeActionIds.value = [...activeActionIds.value, action.id];
    }
  }

  function unregisterAction(id: string) {
    registeredActionsMap.value.delete(id);
    registeredActionsMap.value = new Map(registeredActionsMap.value);
    activeActionIds.value = activeActionIds.value.filter((i) => i !== id);
  }

  return {
    actions,
    registerAction,
    unregisterAction,
  };
};
