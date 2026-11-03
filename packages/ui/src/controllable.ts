import { createSignal, type Accessor } from "solid-js";

/**
 * Controlled/uncontrolled state for a `value` / `defaultValue` / `onValueChange` prop trio.
 *
 * Controlled when `value()` is not `undefined`: the parent owns the state and `set` only
 * reports the change. Uncontrolled otherwise: an internal signal seeded from `defaultValue`.
 * Explicit `undefined` means uncontrolled, and `null`, `""`, and `false` are valid controlled values.
 */
export function createControllable<T>(
  value: () => T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
): [current: Accessor<T>, set: (next: T) => void] {
  // Boxed: `createSignal` treats a bare function as a derived computation, and `T` may be a function.
  // The same `===` equality as Solid's default keeps subscriber notifications unchanged.
  const [internal, setInternal] = createSignal<{ value: T }>(
    { value: defaultValue },
    { equals: (a, b) => a.value === b.value },
  );
  const current = (): T => {
    const controlled = value();
    return controlled !== undefined ? controlled : internal().value;
  };
  const set = (next: T): void => {
    if (value() === undefined) setInternal({ value: next });
    onChange?.(next);
  };
  return [current, set];
}
