import { ref, type MaybeRefOrGetter, toValue } from "vue"
import type { Property, PropertyGroup, BasePageProperties } from "@/types/pages"

export const useInfobox = (
  propertiesRef: MaybeRefOrGetter<BasePageProperties>,
  localeRef = ref("en")
) => {
  const locale = localeRef

  const isFieldVisible = (schema: Property, isReadOnly: boolean) => {
    if (!schema) return false
    const properties = toValue(propertiesRef)
    const passesLogic = !schema.visibleIf || schema.visibleIf(properties)
    if (!passesLogic) return false

    if (isReadOnly) {
      const val = schema.defaultValue

      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        const v = val as Record<string, any>
        if (v[locale.value] !== undefined && String(v[locale.value]).trim() !== "") return true
        if (v["en"] !== undefined && String(v["en"]).trim() !== "") return true

        return Object.values(v).some(
          (x) => x !== undefined && x !== null && String(x).trim() !== ""
        )
      }

      if (schema.type === "text") return !!val && String(val).trim() !== ""
      if (schema.type === "text-array") return Array.isArray(val) && val.length > 0
      if (schema.type === "page-array") return Array.isArray(val) && val.length > 0
      if (schema.type === "page") return !!val
      if (schema.type === "number") return val !== undefined && val !== null

      return val !== undefined && val !== null && val !== ""
    }
    return true
  }

  const shouldRenderGroup = (group: PropertyGroup, isReadOnly: boolean) => {
    if (!group || !group.fields) return false
    return Object.values(group.fields).some((schema) => isFieldVisible(schema, isReadOnly))
  }

  const getSortedFields = (fields: Record<string, Property>) => {
    if (!fields) return []
    return Object.entries(fields).toSorted(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
  }

  const getSortedGroups = (props: MaybeRefOrGetter<BasePageProperties>) => {
    const p = toValue(props)
    if (!p) return []
    return (Object.entries(p) as [string, PropertyGroup][]).toSorted(
      ([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0)
    )
  }

  return {
    isFieldVisible,
    shouldRenderGroup,
    getSortedFields,
    getSortedGroups,
    locale
  }
}
