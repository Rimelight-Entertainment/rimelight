import { type MaybeRefOrGetter, toValue } from "vue"
import type {
  Localized,
  Page,
  PageVersion,
  BasePageProperties,
  PageDefinition,
  Property,
  PropertyGroup
} from "../types/pages"
import type { Block, SectionBlock } from "../types/blocks"

function getValue(value: object, key: string): unknown {
  return Reflect.get(value, key)
}

export const getLocalizedContent = <T = string>(
  field: Localized<T> | T | undefined,
  currentLocale: MaybeRefOrGetter<string>
): T | string => {
  if (field === undefined || field === null) return ""
  if (typeof field !== "object") return String(field)

  const locale = toValue(currentLocale)

  if (Object.keys(field).length === 0) return ""

  const val = getValue(field, locale) ?? getValue(field, "en")
  if (val !== undefined && val !== null) {
    if (typeof val === "string") return val
    if (typeof val === "object") {
      const innerVal = getValue(val, locale) ?? getValue(val, "en")
      if (typeof innerVal === "string") return innerVal
      const firstString = Object.values(val).find((v) => typeof v === "string")
      if (firstString !== undefined) return firstString
    }
  }

  const firstVal = Object.values(field).find((v) => typeof v === "string" && v.trim() !== "")
  if (firstVal !== undefined) return String(firstVal)

  return ""
}

export function syncPageWithDefinition(page: Page, definition?: PageDefinition): Page {
  if (!definition) return page

  const updatedProperties: BasePageProperties = {}
  const definitionGroups = definition.properties
  const existingProperties: Record<string, PropertyGroup | undefined> = page.properties || {}

  for (const [groupId, group] of Object.entries(definitionGroups)) {
    const definitionGroup = group
    let existingGroup = existingProperties[groupId]

    if (!existingGroup) {
      const lowerGroupId = groupId.toLowerCase()
      const foundGroupKey = Object.keys(existingProperties).find(
        (k) => k.toLowerCase() === lowerGroupId
      )
      if (foundGroupKey) {
        existingGroup = existingProperties[foundGroupKey]
      }
    }

    const updatedGroupFields: Record<string, Property> = {}
    const definitionFields = definitionGroup.fields || {}

    for (const [fieldId, field] of Object.entries(definitionFields)) {
      const definitionField = field
      let value = definitionField.defaultValue

      if (existingGroup) {
        if (existingGroup.fields?.[fieldId]?.defaultValue !== undefined) {
          value = existingGroup.fields[fieldId].defaultValue
        } else if (getValue(existingGroup, fieldId) !== undefined) {
          value = getValue(existingGroup, fieldId)
        } else {
          const lowerFieldId = fieldId.toLowerCase()
          const foundKey = Object.keys(existingGroup).find((k) => k.toLowerCase() === lowerFieldId)
          if (foundKey && getValue(existingGroup, foundKey) !== undefined) {
            value = getValue(existingGroup, foundKey)
          }
        }
      }

      updatedGroupFields[fieldId] = {
        ...JSON.parse(JSON.stringify(definitionField)),
        defaultValue: value
      }
    }

    updatedProperties[groupId] = {
      ...definitionGroup,
      fields: updatedGroupFields
    }
  }

  page.properties = updatedProperties

  if (definition.initialBlocks) {
    const templateBlocks = definition.initialBlocks()
    const currentBlocks = page.blocks || []
    const definitionTemplatedBlocks = templateBlocks.filter((b) => b.isTemplated)

    let updatedBlocks = currentBlocks.filter((b: Block) => {
      if (!b.isTemplated) return true
      return definitionTemplatedBlocks.some((db: Block) => isSameBlock(b, db))
    })

    for (const db of definitionTemplatedBlocks) {
      const existingIdx = updatedBlocks.findIndex((b: Block) => isSameBlock(b, db))
      const dbIndexAtStart = templateBlocks.findIndex((b: Block) => b.id === db.id)

      if (existingIdx === -1) {
        updatedBlocks.splice(dbIndexAtStart, 0, { ...db })
      } else {
        const existing = updatedBlocks[existingIdx]
        if (!existing) {
          updatedBlocks.splice(dbIndexAtStart, 0, { ...db })
          continue
        }

        if (existing.type === "SectionBlock" && db.type === "SectionBlock") {
          const updated: SectionBlock = {
            ...existing,
            ...db,
            props: {
              ...db.props,
              children: existing.props.children || db.props.children || []
            }
          }
          updatedBlocks[existingIdx] = updated
        } else {
          updatedBlocks[existingIdx] = { ...db }
        }
      }
    }

    page.blocks = updatedBlocks
  }

  return page
}

function isSameBlock(a: any, b: any) {
  if (a.id === b.id) return true
  if (a.type !== b.type) return false
  if (a.type === "SectionBlock" && b.type === "SectionBlock") {
    return a.props.title === b.props.title
  }
  return false
}

export function dehydratePageProperties(properties: BasePageProperties): any {
  const dehydrated: any = {}
  for (const [groupKey, group] of Object.entries(properties)) {
    if (!group?.fields) continue
    dehydrated[groupKey] = {}
    for (const [fieldKey, field] of Object.entries(group.fields)) {
      dehydrated[groupKey][fieldKey] = field.defaultValue
    }
  }
  return dehydrated
}

export function convertVersionToPage(version: PageVersion): Page {
  const blocks = version.content?.blocks || version.blocks || []
  const properties = version.content?.properties || getValue(version, "properties")
  const rawAuthorIds = getValue(version, "authorIds")

  return {
    id: version.pageId || version.id,
    type: version.type,
    blocks: JSON.parse(JSON.stringify(blocks)),
    properties: properties ? JSON.parse(JSON.stringify(properties)) : {},
    authorsIds:
      version.authorsIds ??
      (Array.isArray(rawAuthorIds)
        ? rawAuthorIds.filter((s): s is string => typeof s === "string")
        : []),
    createdAt: version.createdAt ? new Date(version.createdAt) : new Date(),
    updatedAt: version.updatedAt ? new Date(version.updatedAt) : new Date(),
    postedAt: version.postedAt ? new Date(version.postedAt) : null,
    ...(version.banner ? { banner: version.banner } : {}),
    ...(version.icon ? { icon: version.icon } : {}),
    images: version.images || [],
    title: version.title || { en: "" },
    slug: version.slug || "",
    description: version.description || { en: "" },
    tags: version.tags || [],
    links: version.links || []
  }
}

export function getPageResolutionPath(idOrSlug: string): string {
  if (
    !idOrSlug ||
    idOrSlug === "undefined" ||
    idOrSlug === "null" ||
    idOrSlug === "[object Object]"
  )
    return ""

  let clean = idOrSlug.replace(/^(?:.*\/)?api\/pages\/(?:id|find)\//, "")
  clean = clean.replace(/^\/|\/$/g, "")

  const parts = clean.split("/")
  if (parts.length >= 4) {
    const threePart = parts.slice(0, 3).join("/")
    const nextThreePart = parts.slice(3, 6).join("/")
    if (threePart === nextThreePart) {
      clean = parts.slice(3).join("/")
    }
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean)
  return isUuid ? `/api/pages/id/${clean}` : `/api/pages/find/${clean}`
}
