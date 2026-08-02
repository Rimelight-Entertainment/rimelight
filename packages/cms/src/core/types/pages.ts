import type { BaseBlock } from "./blocks"

export type Localized<T = string> = Record<string, T>

export type PageType = "wiki" | "article" | "doc" | "announcement" | "landing" | (string & {})

export interface RegisterPageTypes {
  wiki: Record<string, any>
  article: Record<string, any>
  doc: Record<string, any>
  announcement: Record<string, any>
  landing: Record<string, any>
  [key: string]: Record<string, any>
}

export interface PageMetadata {
  id: string
  slug: string
  type: PageType
  templateId?: string | null
  templateVersion?: number
  title: Localized
  description?: Localized
  tags?: Localized[]
  authorIds?: string[]
  publishedVersionId?: string | null
  postedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

export interface PageContent<P = Record<string, any>> {
  blocks: BaseBlock[]
  properties: P
}
