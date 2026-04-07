import { z } from "astro/zod"

// Constants
import { THEMES } from "./constants"

// Zod Schemas
export const ThemeSchema = z.enum(THEMES)

// Inference Types
export type Theme = z.infer<typeof ThemeSchema>
