import type { BaseBlock } from "./types/blocks";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValidUUID(uuid: string): boolean {
  return UUID_REGEX.test(uuid);
}

export function validateBlockAST(blocks: BaseBlock[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  function checkBlocks(nodes: BaseBlock[]) {
    for (const b of nodes) {
      if (!b.id || typeof b.id !== "string" || !isValidUUID(b.id)) {
        errors.push(`Block of type '${b.type}' has invalid UUID identifier: '${b.id}'`);
      }
      if (!b.type || typeof b.type !== "string") {
        errors.push(`Block missing valid 'type' field`);
      }
      if (b.children && Array.isArray(b.children)) {
        checkBlocks(b.children);
      }
    }
  }

  checkBlocks(blocks);
  return { valid: errors.length === 0, errors };
}
