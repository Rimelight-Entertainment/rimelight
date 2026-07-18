import type { defaultColors } from "../config/colors"

export type Theme = "light" | "dark"

export interface CustomColors {}

type AddCustomColors<T> = [keyof T] extends [never]
  ? (typeof defaultColors)[number]
  : (typeof defaultColors)[number] | keyof T

export type ThemeColor = AddCustomColors<CustomColors> | "neutral"
