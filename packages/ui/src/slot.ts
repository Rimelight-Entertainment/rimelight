import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";

/** Invokes a render-function slot with its context, or returns a static slot node as-is. */
export function renderSlot<Ctx = void>(
  value: JSX.Element | ((ctx: Ctx) => JSX.Element),
  ctx?: Ctx,
): JSX.Element {
  return typeof value === "function" ? (value as (ctx?: Ctx) => JSX.Element)(ctx) : value;
}

/**
 * The only way a component reads a slot prop.
 *
 * Solid compiles JSX prop values into getters, so every read of `props.xSlot` builds a new
 * subtree and consumes hydration ids. Reading through one memo means the subtree is built
 * once per owner and matches the server render.
 *
 * Rules:
 * - Pass a getter for the prop: `slot(() => props.headerSlot)`.
 * - The helper never calls the value. Function-typed slots (render props, lazy overlay
 *   content) are returned as-is and invoked by the component at the render site.
 * - Overlay content slots are function-typed only, so the memo holds a function and no DOM
 *   is built while the overlay is closed.
 */
export function slot<T>(get: () => T): Accessor<T> {
  return createMemo(get);
}
