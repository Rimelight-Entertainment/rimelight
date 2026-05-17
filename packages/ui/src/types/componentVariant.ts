export type ComponentVariants<T extends { variants?: Record<string, Record<string, unknown>> }> =
  T["variants"] extends Record<string, Record<string, unknown>>
    ? {
        [K in keyof T["variants"]]?: T["variants"][K] extends { true: unknown; false: unknown }
          ? boolean
          : T["variants"][K] extends { true: unknown }
            ? boolean
            : keyof T["variants"][K]
      }
    : never
