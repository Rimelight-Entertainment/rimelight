import type { ClassValue, ThemeConfig } from "./types";
import { getUIConfig } from "./runtime";

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

interface CompiledCV<S extends string> {
  matchers: Array<{ key: string; exp: any }>;
  entries: SlotEntry<S>[];
}

interface CompiledTheme<S extends string> {
  slots: readonly S[];
  actualRootSlot: S;
  autoColor: boolean;
  defaultVariants: Record<string, any>;
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
    const matchers: Array<{ key: string; exp: any }> = [];
    for (const k in rest) {
      matchers.push({ key: k, exp: rest[k] });
    }
    result.push({ matchers, entries });
  }
  return result;
}

function compileTheme<S extends string>(
  baseConfig: ThemeConfig<S>,
  customConfig?: ThemeConfig<string>,
): CompiledTheme<S> {
  const slots = (customConfig?.slots ?? baseConfig.slots ?? ["root" as S]) as readonly S[];
  const actualRootSlot = (slots.includes("root" as S) ? "root" : slots[0] || "root") as S;
  const autoColor =
    customConfig?.variants?.["color"] === "auto" || baseConfig.variants?.["color"] === "auto";
  const defaultVariants: Record<string, any> = {
    ...baseConfig.defaultVariants,
    ...customConfig?.defaultVariants,
  };

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
    compiledCV,
    baseMap,
    variants,
    variantKeys,
  };
}

export function defineTheme<const S extends string>(name: string, themeConfig: ThemeConfig<S>) {
  const staticCompiled = compileTheme(themeConfig);

  let cachedCustomRef: ThemeConfig<string> | undefined;
  let cachedCompiled: CompiledTheme<S> = staticCompiled;

  const getCompiled = (custom: ThemeConfig<string> | undefined): CompiledTheme<S> => {
    if (!custom) return staticCompiled;
    if (custom === cachedCustomRef) return cachedCompiled;
    cachedCustomRef = custom;
    cachedCompiled = compileTheme(themeConfig, custom);
    return cachedCompiled;
  };

  return (props: any = {}): Record<S, string> => {
    const currentConfig = getUIConfig();
    const custom = currentConfig?.components?.themes?.[name];
    const {
      slots,
      actualRootSlot,
      autoColor,
      defaultVariants,
      compiledCV,
      baseMap,
      variants,
      variantKeys,
    } = getCompiled(custom);

    if (currentConfig?.unstyled) {
      const res = {} as Record<S, string>;
      const rootBase = props.class ? toVal(props.class) : "";
      const ui = props.ui;
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
      const selected = props[key] !== undefined ? props[key] : defaultVariants[key];
      const entries = selected != null ? variants[key]?.[selected] : undefined;
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
        const actual = props[key] !== undefined ? props[key] : defaultVariants[key];
        if (Array.isArray(exp) ? !exp.includes(actual) : actual !== exp) {
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
      const color = props.color ?? defaultVariants["color"];
      if (color) {
        const rootCls = res[actualRootSlot];
        res[actualRootSlot] = rootCls ? `${rootCls} rl-color-${color}` : `rl-color-${color}`;
      }
    }

    if (props.class) {
      const extra = toVal(props.class);
      if (extra) {
        const rootCls = res[actualRootSlot];
        res[actualRootSlot] = rootCls ? `${rootCls} ${extra}` : extra;
      }
    }

    const ui = props.ui;
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
}
