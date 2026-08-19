import type { BaseBlock } from "../../core/types/blocks"

export function getBlockChildren(b: BaseBlock): BaseBlock[] {
  if (!b) return []
  if (Array.isArray(b.props?.children)) return b.props.children
  if (Array.isArray(b.children)) return b.children
  return []
}

export function sanitizeBlockTree(blocks: BaseBlock[]): BaseBlock[] {
  if (!Array.isArray(blocks)) return []

  const childIds = new Set<string>()

  for (const b of blocks) {
    if (!b) continue
    const children = getBlockChildren(b)
    if (Array.isArray(children) && children.length > 0) {
      const collect = (list: BaseBlock[]) => {
        for (const child of list) {
          if (child && child.id) {
            childIds.add(child.id)
            const sub = getBlockChildren(child)
            if (Array.isArray(sub) && sub.length > 0) collect(sub)
          }
        }
      }
      collect(children)
    }
  }

  return blocks.filter((b) => b && b.id && !childIds.has(b.id))
}
