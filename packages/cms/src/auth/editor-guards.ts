import type { BaseBlock } from "../core/types/blocks"
import type { UserSessionContext } from "./permissions"

/**
 * Checks if a user has edit rights over a specific block
 */
export function canUserEditBlock(block: BaseBlock, session?: UserSessionContext): boolean {
  if (block.allowedRoles && block.allowedRoles.length > 0) {
    if (!session || !session.roles.some((r) => block.allowedRoles!.includes(r))) {
      return false
    }
  }
  if (block.requiredPermission) {
    if (!session || !session.permissions.includes(block.requiredPermission)) {
      return false
    }
  }
  return true
}

/**
 * Recursively checks if a block or ANY of its descendants are locked or un-editable
 */
export function hasLockedDescendants(block: BaseBlock, session?: UserSessionContext): boolean {
  if (!canUserEditBlock(block, session)) return true
  if (block.isTemplated) return true

  if (block.children?.length) {
    return block.children.some((child) => hasLockedDescendants(child, session))
  }

  return false
}

/**
 * Server-Side Guard: Validates that an incoming edited block tree obeys templated & authorization
 * invariants
 */
export function validateServerBlockPayload(
  existingTree: BaseBlock[],
  incomingTree: BaseBlock[]
): { valid: boolean; reason?: string } {
  const existingTemplated = extractTemplatedBlocks(existingTree)
  const incomingTemplated = extractTemplatedBlocks(incomingTree)

  if (existingTemplated.length !== incomingTemplated.length) {
    return { valid: false, reason: "Forbidden: One or more templated blocks were removed." }
  }

  for (let i = 0; i < existingTemplated.length; i++) {
    if (
      existingTemplated[i].id !== incomingTemplated[i].id ||
      existingTemplated[i].type !== incomingTemplated[i].type
    ) {
      return { valid: false, reason: "Forbidden: Reordering of templated blocks is forbidden." }
    }
  }

  for (const existingBlock of existingTemplated) {
    const incomingBlock = incomingTemplated.find(
      (b) => b.type === existingBlock.type && b.id === existingBlock.id
    )
    if (!incomingBlock) {
      return {
        valid: false,
        reason: `Forbidden: Templated block ${existingBlock.type} (ID: ${existingBlock.id}) missing in payload.`
      }
    }

    if (existingBlock.templatedProps === true) {
      if (JSON.stringify(existingBlock.props) !== JSON.stringify(incomingBlock.props)) {
        return {
          valid: false,
          reason: `Forbidden: Cannot modify locked properties on ${existingBlock.type}.`
        }
      }
    } else if (Array.isArray(existingBlock.templatedProps)) {
      for (const key of existingBlock.templatedProps) {
        if (JSON.stringify(existingBlock.props[key]) !== JSON.stringify(incomingBlock.props[key])) {
          return {
            valid: false,
            reason: `Forbidden: Cannot modify locked property '${key}' on ${existingBlock.type}.`
          }
        }
      }
    }
  }

  return { valid: true }
}

function extractTemplatedBlocks(blocks: BaseBlock[]): BaseBlock[] {
  let result: BaseBlock[] = []
  for (const b of blocks) {
    if (b.isTemplated) result.push(b)
    if (b.children?.length) result = result.concat(extractTemplatedBlocks(b.children))
  }
  return result
}
