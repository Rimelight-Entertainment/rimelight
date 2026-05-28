import { defaultColors } from "../presets/defaults"

export type Theme = "flat" | "light" | "dark"

export interface CustomColors {}

export type ThemeColor =
  | typeof defaultColors[number]
  | "neutral"
  | keyof CustomColors

