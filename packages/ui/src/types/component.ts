import type { SlotClassVariantDefinition, SlotClassVariantRecord } from "css-variants"

export const defineTheme = <
  const S extends string,
  const T extends SlotClassVariantRecord<S> | undefined
>(
  theme: SlotClassVariantDefinition<S, T>
) => theme
