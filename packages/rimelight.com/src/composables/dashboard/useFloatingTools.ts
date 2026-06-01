import { type Component, shallowRef, ref } from "vue";

export interface FloatingToolDefinition {
  id: string;
  title: string;
  icon: string;
  component: Component;
  tooltip?: () => string;
  onClose?: () => void;
}

// Module-level globals safe for client-side interactions in Vue Islands
const registeredTools = shallowRef(new Map<string, FloatingToolDefinition>());
const activeToolIds = ref<string[]>([]);
const expandedTools = ref<Record<string, boolean>>({});
const isVisible = ref(false);

export const useFloatingTools = () => {
  function registerTool(definition: FloatingToolDefinition) {
    registeredTools.value.set(definition.id, definition);
  }

  function openTool(id: string) {
    if (!registeredTools.value.has(id)) return;

    if (!activeToolIds.value.includes(id)) {
      activeToolIds.value.push(id);
    }
    expandedTools.value[id] = true;
    isVisible.value = true;
  }

  function removeTool(id: string) {
    const tool = registeredTools.value.get(id);
    if (tool?.onClose) tool.onClose();

    activeToolIds.value = activeToolIds.value.filter((t) => t !== id);
    if (activeToolIds.value.length === 0) {
      isVisible.value = false;
    }
  }

  function toggleExpanded(id: string) {
    expandedTools.value[id] = !expandedTools.value[id];
  }

  return {
    activeToolIds,
    registeredTools,
    isVisible,
    registerTool,
    openTool,
    removeTool,
    toggleExpanded,
    isToolExpanded: (id: string) => expandedTools.value[id] ?? true,
  };
};
