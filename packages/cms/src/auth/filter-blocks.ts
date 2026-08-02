import type { BaseBlock } from "../core/types/blocks"
import type { UserSessionContext } from "./permissions"

/**
 * Pure immutable function for Astro SSR Reader. Returns new array; never mutates input AST
 */
export function filterBlocksForReader(
  blocks: BaseBlock[],
  session?: UserSessionContext
): BaseBlock[] {
  const filtered: BaseBlock[] = []

  for (const block of blocks) {
    if (block.allowedRoles && block.allowedRoles.length > 0) {
      if (!session || !session.roles.some((r) => block.allowedRoles!.includes(r))) {
        continue
      }
    }
    if (block.requiredPermission) {
      if (!session || !session.permissions.includes(block.requiredPermission)) {
        continue
      }
    }

    const filteredChildren = block.children?.length
      ? filterBlocksForReader(block.children, session)
      : block.children

    filtered.push({
      id: block.id,
      type: block.type,
      props: block.props,
      children: filteredChildren,
      isTemplated: block.isTemplated,
      templatedProps: block.templatedProps,
      allowedRoles: block.allowedRoles,
      requiredPermission: block.requiredPermission
    } as BaseBlock)
  }

  return filtered
}
