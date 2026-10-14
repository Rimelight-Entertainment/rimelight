import { getUIConfig } from "./ui-config";
import type { ClassValue, ThemeConfig } from "./types";
import "./virtual-config";
export { getUIConfig, setUIConfig, setRimelightUITestConfig } from "./ui-config";

export function cx(...args: ClassValue[]): string {
  let str = "";
  for (let i = 0; i < args.length; i++) {
    const val = args[i];
    if (!val) continue;
    if (typeof val === "string" || typeof val === "number") {
      str += (str ? " " : "") + val;
    } else if (Array.isArray(val)) {
      if (val.length) {
        const inner = cx(...val);
        if (inner) str += (str ? " " : "") + inner;
      }
    } else if (typeof val === "object") {
      for (const k in val) {
        if (val[k]) str += (str ? " " : "") + k;
      }
    }
  }
  return str;
}

export function defineTheme<const S extends string>(name: string, themeConfig: ThemeConfig<S>) {
  const defaultSlots = (themeConfig.slots ?? ["root" as S]) as readonly S[];

  const defaultAutoColor = themeConfig.variants?.["color"] === "auto";
  const defaultVariants = { ...themeConfig.defaultVariants };
  const staticCompoundVariants = [...(themeConfig.compoundVariants ?? [])];

  const staticCompiledCV = staticCompoundVariants.map((cv) => {
    const { classNames, class: cls, ...rest } = cv;
    const matchers: Array<{ key: string; exp: any }> = [];
    for (const k in rest) {
      matchers.push({ key: k, exp: rest[k] });
    }
    return { matchers, cls: classNames || cls };
  });

  const staticBaseMap: Record<string, string> = {};
  for (let i = 0; i < defaultSlots.length; i++) {
    const s = defaultSlots[i]!;
    staticBaseMap[s] = themeConfig.base?.[s] ? cx(themeConfig.base[s]) : "";
  }

  return (props: any = {}): Record<S, string> => {
    const currentConfig = getUIConfig();
    const custom = currentConfig?.components?.themes?.[name];
    const isUnstyled = currentConfig?.unstyled;

    const slots = (custom?.slots ?? defaultSlots) as readonly S[];
    const actualRootSlot = (slots.includes("root" as S) ? "root" : slots[0] || "root") as S;

    if (isUnstyled) {
      const res = {} as Record<S, string>;
      const hasClass = props.class || props.className;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]!;
        const base = slot === actualRootSlot && hasClass ? cx(props.class, props.className) : "";
        const fn = props.ui?.[slot];
        res[slot] = typeof fn === "function" ? fn(base) : cx(base, fn);
      }
      return res;
    }

    const autoColor =
      (custom?.variants ?? themeConfig.variants)?.["color"] === "auto" || defaultAutoColor;
    const mergedDefaultVariants = { ...defaultVariants, ...custom?.defaultVariants };
    const customCV = custom?.compoundVariants ?? [];

    const compiledCV = customCV.length
      ? [
          ...staticCompiledCV,
          ...customCV.map((cv: any) => {
            const { classNames, class: cls, ...rest } = cv;
            const matchers: Array<{ key: string; exp: any }> = [];
            for (const k in rest) {
              matchers.push({ key: k, exp: rest[k] });
            }
            return { matchers, cls: classNames || cls };
          }),
        ]
      : staticCompiledCV;

    const baseMap: Record<string, string> = {};
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i]!;
      baseMap[s] = cx(staticBaseMap[s], custom?.base?.[s]);
    }

    const variants: Record<string, Record<string, any>> = { ...themeConfig.variants };
    if (custom?.variants) {
      for (const k in custom.variants) variants[k] = { ...variants[k], ...custom.variants[k] };
    }

    const variantKeys = Object.keys(variants).filter((k) => !(k === "color" && autoColor));

    const res = {} as Record<S, string>;
    for (let i = 0; i < slots.length; i++) {
      res[slots[i]!] = baseMap[slots[i]!] || "";
    }

    const values: Record<string, any> = { ...mergedDefaultVariants };
    for (const k in props) {
      if (props[k] !== undefined) {
        values[k] = props[k];
      }
    }
    const color = autoColor ? (props.color ?? mergedDefaultVariants["color"]) : undefined;

    for (let k = 0; k < variantKeys.length; k++) {
      const key = variantKeys[k]!;
      const selected = values[key];
      if (selected != null && variants[key]?.[selected]) {
        const layer = variants[key][selected];
        for (let i = 0; i < slots.length; i++) {
          const s = slots[i]!;
          const l = layer[s];
          if (l) res[s] = res[s] ? `${res[s]} ${cx(l)}` : cx(l);
        }
      }
    }

    if (compiledCV.length) {
      for (let c = 0; c < compiledCV.length; c++) {
        const { matchers, cls } = compiledCV[c]!;
        if (!cls) continue;
        let match = true;
        for (let m = 0; m < matchers.length; m++) {
          const { key, exp } = matchers[m]!;
          const actual = values[key];
          if (Array.isArray(exp) ? !exp.includes(actual) : actual !== exp) {
            match = false;
            break;
          }
        }
        if (match) {
          for (let i = 0; i < slots.length; i++) {
            const s = slots[i]!;
            const l = cls[s];
            if (l) res[s] = res[s] ? `${res[s]} ${cx(l)}` : cx(l);
          }
        }
      }
    }

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!;
      let slotClass = res[slot]!;
      if (slot === actualRootSlot) {
        if (color) slotClass = slotClass ? `${slotClass} rl-color-${color}` : `rl-color-${color}`;
        const extra = cx(props.class, props.className);
        if (extra) slotClass = slotClass ? `${slotClass} ${extra}` : extra;
      }
      const override = props.ui?.[slot];
      res[slot] = typeof override === "function" ? override(slotClass) : cx(slotClass, override);
    }

    return res;
  };
}
