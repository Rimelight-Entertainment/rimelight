import { onUnmounted } from "vue"
import { defineShortcuts } from "../utils/shortcuts"
import type { ShortcutsConfig, ShortcutsOptions } from "../utils/shortcuts"

export function useShortcuts(config: ShortcutsConfig, options?: ShortcutsOptions) {
  const cleanup = defineShortcuts(config, options)
  onUnmounted(() => {
    cleanup()
  })
  return cleanup
}
