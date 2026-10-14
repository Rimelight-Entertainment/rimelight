import { children as resolveChildren } from "solid-js";
import type { JSX } from "@solidjs/web";

export function childSlotName(child: unknown): string | undefined {
  if (!child || typeof child !== "object") return undefined;
  const el = child as Element;
  if (typeof el.getAttribute === "function") {
    const attr = el.getAttribute("slot") || el.getAttribute("data-slot");
    if (attr) return attr;
  }
  // Solid SSR renders elements as { t: string | string[] } — inspect the opening tag.
  const t = (child as { t?: unknown }).t;
  const head = Array.isArray(t) ? t[0] : t;
  if (typeof head === "string") {
    const m = /\sslot="?([^\s">]+)/.exec(head);
    if (m) return m[1];
  }
  return undefined;
}

export function toArray<T>(value: T | T[] | null | undefined): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

export function findSlotChild(list: readonly unknown[], name: string | readonly string[]): unknown {
  return list.find((child) => {
    const slot = childSlotName(child);
    if (slot == null) return false;
    return typeof name === "string" ? slot === name : name.includes(slot);
  });
}

export function filterSlotChildren(
  list: readonly unknown[],
  exclude: readonly string[],
): unknown[] {
  return list.filter((child) => {
    const slot = childSlotName(child);
    return !slot || !exclude.includes(slot);
  });
}

export function evalSlot(slot: unknown): JSX.Element {
  return typeof slot === "function" ? (slot as () => JSX.Element)() : (slot as JSX.Element);
}

export function createSlotResolver(childrenProp: () => JSX.Element | undefined) {
  const resolved = resolveChildren(childrenProp);
  const list = () => toArray(resolved() as unknown);
  const find = (name: string) => findSlotChild(list(), name);
  const body = (exclude: readonly string[]) => filterSlotChildren(list(), exclude);
  return { list, find, body };
}
