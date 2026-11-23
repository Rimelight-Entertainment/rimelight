import type { BaseBlock } from "../core/types/blocks";
import type { UserSessionContext } from "./permissions";

/**
 * Pure immutable function for SSR readers. Returns new array; never mutates input AST.
 * Blocks marked `visibility: "internal"` are Space-internal and are dropped for every reader,
 * including nested children. Role and permission gates apply to the rest.
 */
export function filterBlocksForReader(
  blocks: BaseBlock[],
  session?: UserSessionContext,
): BaseBlock[] {
  const filtered: BaseBlock[] = [];

  for (const block of blocks) {
    if (block.visibility === "internal") continue;
    if (block.allowedRoles && block.allowedRoles.length > 0) {
      if (!session || !session.roles.some((r) => block.allowedRoles!.includes(r))) {
        continue;
      }
    }
    if (block.requiredPermission) {
      if (!session || !session.permissions.includes(block.requiredPermission)) {
        continue;
      }
    }

    const filteredChildren = block.children?.length
      ? filterBlocksForReader(block.children, session)
      : block.children;

    const newBlock: BaseBlock = {
      id: block.id,
      type: block.type,
      props: block.props,
    };
    if (filteredChildren !== undefined) newBlock.children = filteredChildren;
    if (block.isTemplated !== undefined) newBlock.isTemplated = block.isTemplated;
    if (block.templatedProps !== undefined) newBlock.templatedProps = block.templatedProps;
    if (block.allowedRoles !== undefined) newBlock.allowedRoles = block.allowedRoles;
    if (block.requiredPermission !== undefined)
      newBlock.requiredPermission = block.requiredPermission;
    filtered.push(newBlock);
  }

  return filtered;
}
