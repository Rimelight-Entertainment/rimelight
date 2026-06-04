import { ref, type MaybeRefOrGetter, toValue } from "vue"
import type { Property, PropertyGroup, BasePageProperties } from "@/types/pages"

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v)
}

function hasNonEmptyStringValue(v: unknown): boolean {
  if (v === undefined || v === null) return false
  if (typeof v === "string") return v.trim() !== ""
  if (typeof v === "number" || typeof v === "boolean") return String(v).trim() !== ""
  return false
}

function getSortedFields(fields: Record<string, Property>) {
  if (!fields) return []
  return Object.entries(fields).toSorted(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
}

function getSortedGroups(props: MaybeRefOrGetter<BasePageProperties>) {
  const p = toValue(props)
  if (!p) return []
  return Object.entries(p)
    .filter((entry): entry is [string, PropertyGroup] => entry[1] !== undefined)
    .toSorted(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
}

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

      if (isRecord(val)) {
        if (
          val[locale.value] !== undefined &&
          val[locale.value] !== null &&
          hasNonEmptyStringValue(val[locale.value])
        )
          return true
        if (val["en"] !== undefined && val["en"] !== null && hasNonEmptyStringValue(val["en"]))
          return true

        return Object.values(val).some((x) => hasNonEmptyStringValue(x))
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

  return {
    isFieldVisible,
    shouldRenderGroup,
    getSortedFields,
    getSortedGroups,
    locale
  }
}
