import type { InjectionKey, ComputedRef } from "vue"

export const SECTION_LEVEL_KEY = Symbol("section-level") as InjectionKey<ComputedRef<number>>
