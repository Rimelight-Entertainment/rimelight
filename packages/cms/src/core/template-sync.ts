import type { BaseBlock } from "./types/blocks"

/**
 * Merges updated template blocks into an existing page block tree. Matches templated blocks by
 * block `type` + `isTemplated: true` tag and structural index. Fits updated template anchors while
 * preserving user-inserted custom blocks around them.
 */
export function mergeTemplateBlocks(
  existingPageBlocks: BaseBlock[],
  newTemplateBlocks: BaseBlock[]
): BaseBlock[] {
  const merged: BaseBlock[] = []

  const newTemplatedAnchors = newTemplateBlocks.filter((b) => b.isTemplated)
  let existingIndex = 0

  for (const templateAnchor of newTemplatedAnchors) {
    // Collect user-inserted custom blocks preceding this template anchor
    while (
      existingIndex < existingPageBlocks.length &&
      !existingPageBlocks[existingIndex]?.isTemplated
    ) {
      const block = existingPageBlocks[existingIndex]
      if (block) merged.push(block)
      existingIndex++
    }

    // Match existing template anchor by block type
    const existingAnchor = existingPageBlocks[existingIndex]

    if (existingAnchor && existingAnchor.type === templateAnchor.type) {
      merged.push({
        ...templateAnchor,
        id: existingAnchor.id,
        props: mergeBlockProps(
          existingAnchor.props,
          templateAnchor.props,
          existingAnchor.templatedProps
        )
      })
      existingIndex++
    } else {
      // New template anchor inserted in template update: add fresh block with new random UUID
      merged.push({
        ...templateAnchor,
        id: crypto.randomUUID()
      })
    }
  }

  // Append any remaining custom user blocks at the end of the document
  while (existingIndex < existingPageBlocks.length) {
    const block = existingPageBlocks[existingIndex]
    if (block) merged.push(block)
    existingIndex++
  }

  return merged
}

function mergeBlockProps(
  existingProps: any,
  templateProps: any,
  templatedProps?: boolean | string[]
) {
  if (templatedProps === true) return { ...templateProps }
  if (Array.isArray(templatedProps)) {
    const updated = { ...existingProps }
    for (const key of templatedProps) {
      updated[key] = templateProps[key]
    }
    return updated
  }
  return { ...existingProps, ...templateProps }
}
