import type { BaseBlock } from "../core/types/blocks";
import type { UserSessionContext } from "./permissions";

/**
 * Checks if a user has edit rights over a specific block
 */
export function canUserEditBlock(block: BaseBlock, session?: UserSessionContext): boolean {
  if (block.allowedRoles && block.allowedRoles.length > 0) {
    if (!session || !session.roles.some((r) => block.allowedRoles!.includes(r))) {
      return false;
    }
  }
  if (block.requiredPermission) {
    if (!session || !session.permissions.includes(block.requiredPermission)) {
      return false;
    }
  }
  return true;
}

/**
 * Recursively checks if a block or ANY of its descendants are locked or un-editable
 */
export function hasLockedDescendants(block: BaseBlock, session?: UserSessionContext): boolean {
  if (!canUserEditBlock(block, session)) return true;
  if (block.isTemplated) return true;

  if (block.children?.length) {
    return block.children.some((child) => hasLockedDescendants(child, session));
  }

  return false;
}

/**
 * Server-Side Guard: Validates that an incoming edited block tree obeys templated & authorization
 * invariants
 */
export function validateServerBlockPayload(
  existingTree: BaseBlock[],
  incomingTree: BaseBlock[],
  session?: UserSessionContext,
): { valid: boolean; reason?: string } {
  const existingTemplated = extractTemplatedBlocks(existingTree);
  const incomingTemplated = extractTemplatedBlocks(incomingTree);

  if (existingTemplated.length !== incomingTemplated.length) {
    return { valid: false, reason: "Forbidden: One or more templated blocks were removed." };
  }

  for (let i = 0; i < existingTemplated.length; i++) {
    const existing = existingTemplated[i];
    const incoming = incomingTemplated[i];
    if (!existing || !incoming || existing.id !== incoming.id || existing.type !== incoming.type) {
      return { valid: false, reason: "Forbidden: Reordering of templated blocks is forbidden." };
    }
  }

  for (const existingBlock of existingTemplated) {
    const incomingBlock = incomingTemplated.find(
      (b) => b.type === existingBlock.type && b.id === existingBlock.id,
    );
    if (!incomingBlock) {
      return {
        valid: false,
        reason: `Forbidden: Templated block ${existingBlock.type} (ID: ${existingBlock.id}) missing in payload.`,
      };
    }

    if (existingBlock.templatedProps === true) {
      if (JSON.stringify(existingBlock.props) !== JSON.stringify(incomingBlock.props)) {
        return {
          valid: false,
          reason: `Forbidden: Cannot modify locked properties on ${existingBlock.type}.`,
        };
      }
    } else if (Array.isArray(existingBlock.templatedProps)) {
      for (const key of existingBlock.templatedProps) {
        if (JSON.stringify(existingBlock.props[key]) !== JSON.stringify(incomingBlock.props[key])) {
          return {
            valid: false,
            reason: `Forbidden: Cannot modify locked property '${key}' on ${existingBlock.type}.`,
          };
        }
      }
    }
  }

  if (session) {
    const existingProtected = extractProtectedBlocks(existingTree);
    const incomingMap = new Map(flattenBlocks(incomingTree).map((b) => [b.id, b]));

    for (const existingBlock of existingProtected) {
      const incomingBlock = incomingMap.get(existingBlock.id);
      if (!canUserEditBlock(existingBlock, session)) {
        if (!incomingBlock) {
          return {
            valid: false,
            reason: `Forbidden: Cannot delete protected block ${existingBlock.type} (ID: ${existingBlock.id}).`,
          };
        }
        if (JSON.stringify(existingBlock.props) !== JSON.stringify(incomingBlock.props)) {
          return {
            valid: false,
            reason: `Forbidden: Cannot modify protected block ${existingBlock.type} (ID: ${existingBlock.id}).`,
          };
        }
      }
    }
  }

  return { valid: true };
}

const getChildren = (b: BaseBlock): BaseBlock[] => b?.children ?? [];

function flattenBlocks(blocks: BaseBlock[]): BaseBlock[] {
  let result: BaseBlock[] = [];
  for (const b of blocks) {
    if (!b) continue;
    result.push(b);
    const children = getChildren(b);
    if (children.length) result = result.concat(flattenBlocks(children));
  }
  return result;
}

function extractTemplatedBlocks(blocks: BaseBlock[]): BaseBlock[] {
  let result: BaseBlock[] = [];
  for (const b of blocks) {
    if (!b) continue;
    if (b.isTemplated) result.push(b);
    const children = getChildren(b);
    if (children.length) result = result.concat(extractTemplatedBlocks(children));
  }
  return result;
}

function extractProtectedBlocks(blocks: BaseBlock[]): BaseBlock[] {
  return flattenBlocks(blocks).filter(
    (b) => (b.allowedRoles && b.allowedRoles.length > 0) || !!b.requiredPermission,
  );
}
