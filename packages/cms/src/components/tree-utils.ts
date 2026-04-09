export type TreeItem = {
  value: string
  label: string
  depth: number
  path: string[]
}

export function flattenTree<T extends { children?: T[] }>(
  nodes: T[],
  getValue: (node: T) => string,
  getLabel: (node: T) => string,
  depth = 0,
  path: string[] = []
): TreeItem[] {
  const result: TreeItem[] = []
  for (const node of nodes) {
    const currentPath = [...path, getLabel(node)]
    result.push({
      value: getValue(node),
      label: getLabel(node),
      depth,
      path: currentPath
    })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, getValue, getLabel, depth + 1, currentPath))
    }
  }
  return result
}

export function flattenByParent<T>(
  items: T[],
  getValue: (item: T) => string,
  getLabel: (item: T) => string,
  getParent: (item: T) => string | null
): TreeItem[] {
  const childrenMap = new Map<string | null, T[]>()
  for (const item of items) {
    const parent = getParent(item)
    if (!childrenMap.has(parent)) childrenMap.set(parent, [])
    childrenMap.get(parent)!.push(item)
  }

  const result: TreeItem[] = []
  const walk = (parentId: string | null, depth: number, path: string[]) => {
    for (const item of childrenMap.get(parentId) ?? []) {
      const currentPath = [...path, getLabel(item)]
      result.push({
        value: getValue(item),
        label: getLabel(item),
        depth,
        path: currentPath
      })
      walk(getValue(item), depth + 1, currentPath)
    }
  }
  walk(null, 0, [])
  return result
}
