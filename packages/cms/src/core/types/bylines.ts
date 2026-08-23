export type BylineRole =
  | "written_by"
  | "reviewed_by"
  | "edited_by"
  | "illustrated_by"
  | "translated_by"
  | "curated_by"

export interface BylineCredit {
  userId: string
  role: BylineRole
  customTitle?: string
  displayOrder?: number
}
