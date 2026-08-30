export type Localized<T = string> = Record<string, T>

export type LinkVariant = "solid" | "outline" | "subtle" | "soft" | "ghost" | "link"

export type LinkColor =
  | "primary"
  | "secondary"
  | "neutral"
  | "error"
  | "warning"
  | "success"
  | "info"

export interface Image {
  src: string
  alt: string
  width?: number
  height?: number
  name?: Localized<string>
}

export interface Link {
  label: string
  to: string
  icon?: string
  trailing?: boolean
  color?: LinkColor
  variant?: LinkVariant
}

export type UserAvailability = "available" | "busy" | "invisible"
