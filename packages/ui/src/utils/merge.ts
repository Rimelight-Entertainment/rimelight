export function isPlainObject(value: unknown): boolean {
  if (value === null || typeof value !== "object") {
    return false
  }
  const prototype = Object.getPrototypeOf(value)

  if (
    prototype !== null &&
    prototype !== Object.prototype &&
    Object.getPrototypeOf(prototype) !== null
  ) {
    return false
  }

  if (Symbol.iterator in value) {
    return false
  }

  if (Symbol.toStringTag in value) {
    return Object.prototype.toString.call(value) === "[object Module]"
  }

  return true
}

export function merge<T extends Record<string, any>>(base: T, defaults: Record<string, any>): T

export function merge(
  base: Record<string, any>,
  defaults: Record<string, any>
): Record<string, any> {
  if (!isPlainObject(defaults)) {
    return merge(base, {})
  }
  if (!isPlainObject(base)) {
    return { ...defaults }
  }

  const object = { ...defaults }

  for (const key of Object.keys(base)) {
    if (key === "__proto__" || key === "constructor") {
      continue
    }

    const value = base[key]

    if (value === null || value === undefined) {
      continue
    }

    if (Array.isArray(value) && Array.isArray(object[key])) {
      object[key] = [...value, ...object[key]]
    } else if (isPlainObject(value) && isPlainObject(object[key])) {
      object[key] = merge(value, object[key])
    } else {
      object[key] = value
    }
  }

  return object
}
