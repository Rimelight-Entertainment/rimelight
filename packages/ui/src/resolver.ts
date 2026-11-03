import {
  createMemo,
  createUniqueId,
  isStatic,
  omit,
  untrack,
  type Accessor,
  type Component,
} from "solid-js";
import { dynamic, type ValidComponent } from "@solidjs/web";
import type { BaseThemeProps, ClassValue, InferThemeVariants, ThemeConfig, ThemeUI } from "./types";
import { getUIConfig } from "./runtime";
import { slot } from "./slot";

function toVal(val: ClassValue): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  let str = "";
  if (Array.isArray(val)) {
    for (let i = 0; i < val.length; i++) {
      const inner = toVal(val[i]);
      if (inner) str = str ? `${str} ${inner}` : inner;
    }
  } else if (typeof val === "object") {
    for (const k in val) {
      if (val[k]) str = str ? `${str} ${k}` : k;
    }
  }
  return str;
}

export function cx(...args: ClassValue[]): string {
  let str = "";
  for (let i = 0; i < args.length; i++) {
    const inner = toVal(args[i]);
    if (inner) str = str ? `${str} ${inner}` : inner;
  }
  return str;
}

type SlotEntry<S extends string> = readonly [slot: S, cls: string];

function normalizeKey(val: unknown): string | undefined {
  if (val === undefined || val === null) return undefined;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  return undefined;
}

interface CompiledCV<S extends string> {
  matchers: Array<{ key: string; exp: string | string[] }>;
  entries: SlotEntry<S>[];
}

interface CompiledTheme<S extends string> {
  slots: readonly S[];
  actualRootSlot: S;
  autoColor: boolean;
  defaultVariants: Record<string, any>;
  normalizedDefaults: Record<string, string | undefined>;
  compiledCV: CompiledCV<S>[];
  baseMap: Record<S, string>;
  variants: Record<string, Record<string, SlotEntry<S>[]>>;
  variantKeys: string[];
}

function compileCompoundVariants<S extends string>(
  list: Array<Record<string, any>> | undefined,
  slots: readonly S[],
): CompiledCV<S>[] {
  if (!list?.length) return [];
  const result: CompiledCV<S>[] = [];
  for (let i = 0; i < list.length; i++) {
    const { class: clsMap, ...rest } = list[i]!;
    if (!clsMap) continue;
    const entries: SlotEntry<S>[] = [];
    for (let s = 0; s < slots.length; s++) {
      const slot = slots[s]!;
      const resolved = toVal(clsMap[slot]);
      if (resolved) entries.push([slot, resolved]);
    }
    if (!entries.length) continue;
    const matchers: Array<{ key: string; exp: string | string[] }> = [];
    for (const k in rest) {
      const rawExp = rest[k];
      const exp = Array.isArray(rawExp) ? rawExp.map((v) => String(v)) : String(rawExp);
      matchers.push({ key: k, exp });
    }
    result.push({ matchers, entries });
  }
  return result;
}

function compileTheme<S extends string>(
  baseConfig: ThemeConfig<S, any>,
  customConfig?: ThemeConfig<string, any>,
): CompiledTheme<S> {
  const slots = (customConfig?.slots ?? baseConfig.slots ?? ["root" as S]) as readonly S[];
  const actualRootSlot = (slots.includes("root" as S) ? "root" : slots[0] || "root") as S;
  const autoColor =
    customConfig?.variants?.["color"] === "auto" || baseConfig.variants?.["color"] === "auto";
  const defaultVariants: Record<string, any> = {
    ...baseConfig.defaultVariants,
    ...customConfig?.defaultVariants,
  };
  const normalizedDefaults: Record<string, string | undefined> = {};
  for (const k in defaultVariants) {
    normalizedDefaults[k] = normalizeKey(defaultVariants[k]);
  }

  const baseMap = {} as Record<S, string>;
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i]!;
    baseMap[s] = cx(baseConfig.base?.[s], customConfig?.base?.[s]);
  }

  const rawBaseVariants = baseConfig.variants;
  const rawCustomVariants = customConfig?.variants;
  const variantKeySet = new Set<string>();
  if (rawBaseVariants) {
    for (const k in rawBaseVariants) {
      if (!(k === "color" && autoColor)) variantKeySet.add(k);
    }
  }
  if (rawCustomVariants) {
    for (const k in rawCustomVariants) {
      if (!(k === "color" && autoColor)) variantKeySet.add(k);
    }
  }

  const variantKeys = Array.from(variantKeySet);
  const variants: Record<string, Record<string, SlotEntry<S>[]>> = {};

  for (let k = 0; k < variantKeys.length; k++) {
    const key = variantKeys[k]!;
    const baseGroup = rawBaseVariants?.[key];
    const customGroup = rawCustomVariants?.[key];
    const isBaseObj = baseGroup && typeof baseGroup === "object";
    const isCustomObj = customGroup && typeof customGroup === "object";
    if (!isBaseObj && !isCustomObj) continue;

    const optionKeys = new Set<string>();
    if (isBaseObj) for (const opt in baseGroup) optionKeys.add(opt);
    if (isCustomObj) for (const opt in customGroup) optionKeys.add(opt);

    const compiledGroup: Record<string, SlotEntry<S>[]> = {};
    for (const opt of optionKeys) {
      const baseOpt = isBaseObj ? baseGroup[opt] : undefined;
      const customOpt = isCustomObj ? customGroup[opt] : undefined;
      if (!baseOpt && !customOpt) continue;

      const entries: SlotEntry<S>[] = [];
      for (let i = 0; i < slots.length; i++) {
        const s = slots[i]!;
        const cls = cx(baseOpt?.[s], customOpt?.[s]);
        if (cls) entries.push([s, cls]);
      }
      if (entries.length) {
        compiledGroup[opt] = entries;
      }
    }
    variants[key] = compiledGroup;
  }

  const compiledCV = customConfig?.compoundVariants?.length
    ? [
        ...compileCompoundVariants(baseConfig.compoundVariants, slots),
        ...compileCompoundVariants(customConfig.compoundVariants, slots),
      ]
    : compileCompoundVariants(baseConfig.compoundVariants, slots);

  return {
    slots,
    actualRootSlot,
    autoColor,
    defaultVariants,
    normalizedDefaults,
    compiledCV,
    baseMap,
    variants,
    variantKeys,
  };
}

/** Memoized accessors for the slot keys passed to `setup({ slots })`. */
export type SlotAccessors<T, SK extends keyof T> = { [P in SK]-?: Accessor<T[P]> };

export interface ThemeSetupOptions<
  T extends Record<string, any>,
  K extends keyof T = never,
  SK extends keyof T = never,
> {
  /**
   * Default HTML tag or component when `props.as` is not provided, or a reactive
   * accessor returning the fallback tag (e.g. `() => isInteractive() ? "a" : "div"`).
   * @default "div"
   */
  as?: ValidComponent | (() => ValidComponent);
  /**
   * Additional component-specific prop keys to strip from `rest` (on top of
   * `"as"`, `"ui"`, `"class"`, `"children"`, `"theme"`, and all theme variant keys).
   */
  omit?: readonly K[];
  /**
   * Slot prop keys. Each is read through `slot()` and returned as a memoized accessor in
   * `slots`, and stripped from `rest`. Slot props must only be read through this result.
   */
  slots?: readonly SK[];
  /**
   * Optional reactive accessor for computed variant overrides. Receives the slot accessors
   * from `slots`, so variants can depend on slot presence without reading props directly.
   */
  variants?: (slots: SlotAccessors<T, SK>) => Record<string, any>;
  /**
   * Optional prefix (e.g. `"rl-card"`) to generate a hydration-safe reactive `id()`
   * accessor (`() => props.id || "${idPrefix}-${createUniqueId()}"`).
   */
  idPrefix?: string;
}

export interface ThemeSetupResult<
  S extends string,
  T extends Record<string, any>,
  K extends keyof T = never,
  SK extends keyof T = never,
> {
  Tag: Component<any>;
  classes: Accessor<Record<S, string>>;
  rest: Omit<T, "as" | "ui" | "class" | "children" | "theme" | K | SK>;
  id: Accessor<string>;
  slots: { [P in SK]-?: Accessor<T[P]> };
}

export interface ThemeResolver<
  S extends string = string,
  V extends Record<string, any> = Record<string, any>,
> {
  (props?: any, overrides?: Record<string, any>): Record<S, string>;
  readonly $slots?: S;
  readonly $variants?: V;
  /**
   * One-line component setup returning `{ Tag, classes, rest, id }`.
   */
  setup: <
    T extends Record<string, any>,
    K extends keyof T = never,
    const SK extends keyof T = never,
  >(
    props: T,
    options?: ThemeSetupOptions<T, K, SK>,
  ) => ThemeSetupResult<S, T, K, SK>;
  /**
   * Creates a reactive `createMemo` of resolved slot classes from component `props`
   * and optional computed variant overrides.
   */
  use: (props: any, overrides?: () => Record<string, any>) => Accessor<Record<S, string>>;
  /**
   * Returns a reactive `omit(props, ...)` view that automatically strips `"as"`, `"ui"`,
   * `"class"`, `"children"`, `"theme"`, all theme variant keys, plus any `extraKeys`.
   */
  omit: <T extends Record<string, any>, K extends keyof T = never>(
    props: T,
    ...extraKeys: K[]
  ) => Omit<T, "as" | "ui" | "class" | "children" | "theme" | K>;
  /**
   * Creates a polymorphic root component (`dynamic`) for `props.as ?? defaultTag`,
   * automatically applying `{ static: isStatic(props, "as") }` inside `untrack`.
   */
  tag: (
    props: { as?: ValidComponent; [key: string]: unknown },
    defaultTag?: ValidComponent | (() => ValidComponent),
  ) => Component<any>;
  /**
   * Creates a hydration-safe, reactive ID accessor (`() => props.id || "${prefix}-${uid}"`).
   * Calls `createUniqueId()` unconditionally during component setup so SSR hydration counters
   * never drift, while reading `props.id` lazily inside the accessor so reactive IDs track.
   */
  id: (
    props: { id?: string | undefined; [key: string]: unknown },
    prefix?: string,
  ) => Accessor<string>;
}

/**
 * Infers the full component props type (`as`, `ui` with exact slot names, `class`, `theme`,
 * `children`, plus all variant and `color` props) directly from a `defineTheme(...)` resolver.
 */
export type InferThemeProps<R> =
  R extends ThemeResolver<infer S, infer V> ? BaseThemeProps<S> & InferThemeVariants<V> : never;

export type InferThemeUI<R> = R extends ThemeResolver<infer S, any> ? ThemeUI<S> : never;

const BASE_OMIT_KEYS = ["as", "ui", "class", "children", "theme"] as const;

export function defineTheme<
  const S extends string,
  const V extends Record<string, any> = Record<string, any>,
>(name: string, themeConfig: ThemeConfig<S, V>): ThemeResolver<S, V> {
  const staticCompiled = compileTheme(themeConfig);
  const defaultOmitKeys = Array.from(
    new Set([
      ...BASE_OMIT_KEYS,
      ...staticCompiled.variantKeys,
      ...(staticCompiled.autoColor ? ["color"] : []),
    ]),
  );
  let cachedExtraRef: readonly PropertyKey[] | undefined;
  let cachedMergedOmitKeys: PropertyKey[] | undefined;

  let cachedCustomRef: ThemeConfig<string> | undefined;
  let cachedCompiled: CompiledTheme<S> = staticCompiled;

  const getCompiled = (custom: ThemeConfig<string> | undefined): CompiledTheme<S> => {
    if (!custom) return staticCompiled;
    if (custom === cachedCustomRef) return cachedCompiled;
    cachedCustomRef = custom;
    cachedCompiled = compileTheme(themeConfig, custom);
    return cachedCompiled;
  };

  const resolve = (props: any = {}, overrides?: Record<string, any>): Record<S, string> => {
    const currentConfig = getUIConfig();
    const custom = currentConfig?.components?.themes?.[name];
    const {
      slots,
      actualRootSlot,
      autoColor,
      normalizedDefaults,
      compiledCV,
      baseMap,
      variants,
      variantKeys,
    } = getCompiled(custom);

    if (currentConfig?.unstyled) {
      const res = {} as Record<S, string>;
      const rawClass = overrides && "class" in overrides ? overrides["class"] : props.class;
      const rootBase = rawClass ? toVal(rawClass) : "";
      const ui = overrides && "ui" in overrides ? overrides["ui"] : props.ui;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!;
        const base = slot === actualRootSlot ? rootBase : "";
        const override = ui?.[slot];
        if (typeof override === "function") {
          res[slot] = override(base);
        } else if (override) {
          const extra = toVal(override);
          res[slot] = base && extra ? `${base} ${extra}` : base || extra;
        } else {
          res[slot] = base;
        }
      }
      return res;
    }

    const res = { ...baseMap };

    for (let k = 0; k < variantKeys.length; k++) {
      const key = variantKeys[k]!;
      const rawVal = overrides && key in overrides ? overrides[key] : props[key];
      const selected = rawVal !== undefined ? normalizeKey(rawVal) : normalizedDefaults[key];
      const entries = selected !== undefined ? variants[key]?.[selected] : undefined;
      if (entries) {
        for (let i = 0; i < entries.length; i++) {
          const [s, cls] = entries[i]!;
          res[s] = res[s] ? `${res[s]} ${cls}` : cls;
        }
      }
    }

    for (let c = 0; c < compiledCV.length; c++) {
      const { matchers, entries } = compiledCV[c]!;
      let match = true;
      for (let m = 0; m < matchers.length; m++) {
        const { key, exp } = matchers[m]!;
        const rawVal = overrides && key in overrides ? overrides[key] : props[key];
        const actual = rawVal !== undefined ? normalizeKey(rawVal) : normalizedDefaults[key];
        if (actual === undefined || (Array.isArray(exp) ? !exp.includes(actual) : actual !== exp)) {
          match = false;
          break;
        }
      }
      if (match) {
        for (let i = 0; i < entries.length; i++) {
          const [s, cls] = entries[i]!;
          res[s] = res[s] ? `${res[s]} ${cls}` : cls;
        }
      }
    }

    if (autoColor) {
      const color =
        (overrides && "color" in overrides ? overrides["color"] : props.color) ??
        normalizedDefaults["color"];
      if (color) {
        const rootCls = res[actualRootSlot];
        res[actualRootSlot] = rootCls ? `${rootCls} rl-color-${color}` : `rl-color-${color}`;
      }
    }

    const rawClass = overrides && "class" in overrides ? overrides["class"] : props.class;
    if (rawClass) {
      const extra = toVal(rawClass);
      if (extra) {
        const rootCls = res[actualRootSlot];
        res[actualRootSlot] = rootCls ? `${rootCls} ${extra}` : extra;
      }
    }

    const ui = overrides && "ui" in overrides ? overrides["ui"] : props.ui;
    if (ui) {
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!;
        const override = ui[slot];
        if (typeof override === "function") {
          res[slot] = override(res[slot]!);
        } else if (override) {
          const extra = toVal(override);
          if (extra) {
            res[slot] = res[slot] ? `${res[slot]} ${extra}` : extra;
          }
        }
      }
    }

    return res;
  };

  const omitWithList = <T extends Record<string, any>, K extends keyof T = never>(
    props: T,
    extra?: readonly K[],
  ): Omit<T, "as" | "ui" | "class" | "children" | "theme" | K> => {
    // Solid's `omit` spread overload can't infer the key union from a runtime array,
    // so the result is cast once here instead of at every call site
    let keys: readonly PropertyKey[] = defaultOmitKeys;
    if (extra?.length) {
      if (extra === cachedExtraRef && cachedMergedOmitKeys) {
        keys = cachedMergedOmitKeys;
      } else {
        keys = [...defaultOmitKeys, ...extra];
        cachedExtraRef = extra;
        cachedMergedOmitKeys = keys as PropertyKey[];
      }
    }
    return omit(props, ...(keys as (keyof T)[])) as unknown as Omit<
      T,
      "as" | "ui" | "class" | "children" | "theme" | K
    >;
  };

  resolve.use = (props: any, overrides?: () => Record<string, any>) =>
    createMemo(() => resolve(props, overrides?.()));

  resolve.omit = <T extends Record<string, any>, K extends keyof T = never>(
    props: T,
    ...extraKeys: K[]
  ) => omitWithList(props, extraKeys);

  resolve.tag = (
    props: { as?: ValidComponent; [key: string]: unknown },
    defaultTag: ValidComponent | (() => ValidComponent) = "div",
  ) =>
    typeof defaultTag === "function"
      ? dynamic(() => props.as ?? (defaultTag as () => ValidComponent)())
      : dynamic(() => props.as ?? defaultTag, {
          static: untrack(() => isStatic(props, "as")),
        });

  resolve.id = (
    props: { id?: string | undefined; [key: string]: unknown },
    prefix = `rl-${name}`,
  ): Accessor<string> => {
    const uid = createUniqueId();
    const fallback = prefix ? `${prefix}-${uid}` : uid;
    return () => (props.id as string | undefined) || fallback;
  };

  resolve.setup = <
    T extends Record<string, any>,
    K extends keyof T = never,
    const SK extends keyof T = never,
  >(
    props: T,
    options?: ThemeSetupOptions<T, K, SK>,
  ): ThemeSetupResult<S, T, K, SK> => {
    const id = resolve.id(props, options?.idPrefix);
    const slotKeys = options?.slots ?? [];
    const slots = {} as SlotAccessors<T, SK>;
    for (const key of slotKeys) {
      slots[key] = slot(() => props[key]);
    }
    const variantsFn = options?.variants;
    const omitKeys = slotKeys.length ? [...(options?.omit ?? []), ...slotKeys] : options?.omit;
    return {
      Tag: resolve.tag(props, options?.as),
      classes: resolve.use(props, variantsFn ? () => variantsFn(slots) : undefined),
      rest: omitWithList(props, omitKeys as readonly (K | SK)[] | undefined),
      slots,
      get id() {
        return id;
      },
    };
  };

  return resolve;
}
