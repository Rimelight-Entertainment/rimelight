export interface Atom<T> {
  get: () => T
  set: (next: T) => void
  subscribe: (fn: (val: T) => void) => () => void
}

export function atom<T>(initial: T): Atom<T> {
  let val = initial
  const subs = new Set<(v: T) => void>()
  return {
    get: () => val,
    set: (next: T) => {
      val = next
      subs.forEach((fn) => fn(val))
    },
    subscribe: (fn: (v: T) => void) => {
      subs.add(fn)
      fn(val)
      return () => subs.delete(fn)
    }
  }
}
