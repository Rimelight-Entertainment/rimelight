import type { defaultColors } from "../presets/defaults"

export type Theme = "flat" | "light" | "dark"

export interface CustomColors {}

type AddCustomColors<T> = [keyof T] extends [never]
  ? (typeof defaultColors)[number]
  : (typeof defaultColors)[number] | keyof T

export type ThemeColor = AddCustomColors<CustomColors> | "neutral"
