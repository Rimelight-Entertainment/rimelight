// composables/usePageRegistry.ts
import { reactive, readonly } from "vue"
import { type PageType, type PageDefinition } from "@/types/pages"

const PAGE_DEFINITIONS = reactive<Partial<Record<PageType, PageDefinition>>>({})

export const usePageRegistry = () => {
  const definitions = readonly(PAGE_DEFINITIONS)

  const registerDefinitions = (definitions: Record<string, PageDefinition>) => {
    Object.assign(PAGE_DEFINITIONS, definitions)
  }

  const getTypeLabelKey = (type: PageType): string => {
    const definition = PAGE_DEFINITIONS[type]
    return definition?.typeLabelKey ?? `page.type.${type.toLowerCase()}`
  }

  return {
    registerDefinitions,
    getTypeLabelKey,
    definitions
  }
}
