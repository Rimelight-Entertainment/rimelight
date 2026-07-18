import type { colorConfig } from "../config/color.config"

export type Theme = "light" | "dark"

export interface CustomColors {}

type AddCustomColors<T> = [keyof T] extends [never]
  ? (typeof colorConfig.colors)[number]
  : (typeof colorConfig.colors)[number] | keyof T

export type ThemeColor = AddCustomColors<CustomColors> | "neutral"
