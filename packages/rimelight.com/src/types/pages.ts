import { type Block } from "./blocks"
export type { Block }
import { type Image, type Link } from "./schemas"

export type Localized<T = string> = Record<string, T>

declare global {
  interface RimelightRegisterPageTypes {}
}

export interface RegisterPageTypes extends RimelightRegisterPageTypes {
  Default: BasePageProperties
}

export type PageType = keyof RegisterPageTypes

export interface Property<T = any> {
  defaultValue: T | string | string[] | number | Localized | Localized[]
  label: Localized
  type: "number" | "text" | "text-array" | "enum" | "page" | "page-array"
  options?: string[] | Localized[]
  allowedPageTypes?: PageType[]
  order?: number
  visibleIf?: (properties: any) => boolean
}

export interface PropertyGroup {
  label: Localized
  order?: number
  fields: Record<string, Property>
  defaultOpen: boolean
}

export interface PageDefinition {
  typeLabelKey: string
  properties: Record<string, PropertyGroup>
  initialBlocks?: () => Block[]
}

export interface BasePageProperties {
  [key: string]: PropertyGroup | undefined
}

export interface BasePage {
  id: string
  slug: string
  icon?: Image
  banner?: Image
  images?: Image[]
  title: Localized
  description?: Localized
  tags?: Localized[]
  links?: Link[]
  authorsIds?: string[]
  blocks: Block[]
  postedAt?: Date | null
  createdAt: Date
  updatedAt: Date
  status?: "published" | "draft" | "archived" | (string & {})
}

export interface Page extends BasePage {
  type: PageType
  properties: RegisterPageTypes[PageType]
}

export type SurroundItem = Pick<BasePage, "id" | "slug" | "title" | "description">

export interface PageSurround {
  previous: SurroundItem | null
  next: SurroundItem | null
}

export interface PageVersion extends BasePage {
  pageId: string
  status: "pending" | "approved" | "rejected"
  type: PageType
  content: {
    blocks: Block[]
    properties: RegisterPageTypes[PageType]
  }
  createdBy: string
  approvedBy?: string | null
  approvedAt?: Date | null
}

export function definePageDefinition(definition: PageDefinition): PageDefinition {
  return definition
}
