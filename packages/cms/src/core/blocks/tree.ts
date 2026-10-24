import type { BaseBlock } from "../types/blocks";

/** Pure, immutable operations on block trees. Nested blocks always live in `block.children`. */

export function createBlockId(): string {
  return crypto.randomUUID();
}

export function getChildren(block: BaseBlock | null | undefined): BaseBlock[] {
  return block?.children ?? [];
}

/**
 * Sanitizes untrusted input (API payloads): drops non-blocks, defaults `props`, and replaces
 * missing or duplicate ids. Does not reshape content — stored data is already canonical.
 */
export function normalizeBlocks(input: unknown): BaseBlock[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const visit = (raw: any): BaseBlock | null => {
    if (!raw || typeof raw !== "object" || typeof raw.type !== "string") return null;
    const id = typeof raw.id === "string" && raw.id && !seen.has(raw.id) ? raw.id : createBlockId();
    seen.add(id);
    const block: BaseBlock = { ...raw, id, props: raw.props && typeof raw.props === "object" ? raw.props : {} };
    if (Array.isArray(raw.children)) block.children = raw.children.map(visit).filter(Boolean) as BaseBlock[];
    else delete block.children;
    return block;
  };
  return input.map(visit).filter((b): b is BaseBlock => !!b);
}

export function* walkBlocks(
  blocks: BaseBlock[],
  parent: BaseBlock | null = null,
  depth = 0,
): Generator<{ block: BaseBlock; parent: BaseBlock | null; depth: number; index: number }> {
  for (let index = 0; index < blocks.length; index++) {
    const block = blocks[index]!;
    yield { block, parent, depth, index };
    yield* walkBlocks(getChildren(block), block, depth + 1);
  }
}

export function flattenBlocks(blocks: BaseBlock[]): BaseBlock[] {
  return Array.from(walkBlocks(blocks), (e) => e.block);
}

export function findBlock(
  blocks: BaseBlock[],
  id: string,
): { block: BaseBlock; parent: BaseBlock | null; index: number; depth: number } | null {
  for (const entry of walkBlocks(blocks)) if (entry.block.id === id) return entry;
  return null;
}

/** Maps over every block (depth-first), rebuilding the tree immutably. */
export function mapBlocks(
  blocks: BaseBlock[],
  fn: (block: BaseBlock) => BaseBlock | null,
): BaseBlock[] {
  const out: BaseBlock[] = [];
  for (const block of blocks) {
    const mapped = fn(block);
    if (!mapped) continue;
    const kids = getChildren(mapped);
    out.push(kids.length ? { ...mapped, children: mapBlocks(kids, fn) } : mapped);
  }
  return out;
}

export function updateBlock(
  blocks: BaseBlock[],
  id: string,
  patch: (block: BaseBlock) => BaseBlock,
): BaseBlock[] {
  return mapBlocks(blocks, (b) => (b.id === id ? patch(b) : b));
}

export function removeBlock(blocks: BaseBlock[], id: string): BaseBlock[] {
  return mapBlocks(blocks, (b) => (b.id === id ? null : b));
}

/** Inserts `block` into `parentId`'s children (or the root when null) at `index`. */
export function insertBlock(
  blocks: BaseBlock[],
  block: BaseBlock,
  parentId: string | null,
  index: number,
): BaseBlock[] {
  const place = (list: BaseBlock[]) => {
    const next = [...list];
    next.splice(Math.max(0, Math.min(index, next.length)), 0, block);
    return next;
  };
  if (!parentId) return place(blocks);
  return updateBlock(blocks, parentId, (p) => ({ ...p, children: place(getChildren(p)) }));
}

/** Moves a block to a new parent/index. No-op if the target is inside the moved block. */
export function moveBlock(
  blocks: BaseBlock[],
  id: string,
  parentId: string | null,
  index: number,
): BaseBlock[] {
  const found = findBlock(blocks, id);
  if (!found) return blocks;
  if (parentId && (parentId === id || findBlock(getChildren(found.block), parentId))) return blocks;
  const without = removeBlock(blocks, id);
  // Moving down within the same list shifts the target index by one.
  const sameParent = (found.parent?.id ?? null) === parentId;
  const adjusted = sameParent && index > found.index ? index - 1 : index;
  return insertBlock(without, found.block, parentId, adjusted);
}

/** Deep copy of a block with fresh ids (for duplicate / paste). */
export function cloneBlock(block: BaseBlock): BaseBlock {
  const copy = structuredClone(block);
  for (const { block: b } of walkBlocks([copy])) b.id = createBlockId();
  return copy;
}
