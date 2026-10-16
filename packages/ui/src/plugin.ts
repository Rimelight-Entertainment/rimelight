import UnoCSS from "@unocss/vite";
import type { Plugin, PluginOption } from "vite-plus";
import { rimelightUiPreset } from "./preset";
import type { UIConfig } from "./types";

export type RimelightUiPluginOptions = UIConfig;

export const VIRTUAL_ID = "virtual:rimelight-ui";
export const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export function ui({ unocss = {}, ...cfg }: UIConfig = {}): PluginOption {
  const runtimeCfg: UIConfig = {
    ...(cfg.unstyled !== undefined ? { unstyled: cfg.unstyled } : {}),
    ...(cfg.icons ? { icons: cfg.icons } : {}),
    ...(cfg.shortcuts ? { shortcuts: cfg.shortcuts } : {}),
    ...(cfg.logos ? { logos: cfg.logos } : {}),
    ...(cfg.components ? { components: cfg.components } : {}),
  };

  const virtualPlugin: Plugin = {
    name: "rimelight:ui",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export const config = ${JSON.stringify(runtimeCfg)};\nexport default config;`;
      }
      return null;
    },
  };

  return [
    ...(UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(cfg), ...(unocss.presets || [])],
      content: {
        ...unocss.content,
        pipeline: unocss.content?.pipeline !== false && {
          ...unocss.content?.pipeline,
          include: [
            /\.([jt]sx?|mdx?|html)($|\?)/,
            /[\\/](@rimelight\/(ui|cms)|packages\/(ui|cms))[\\/]/,
            ...[unocss.content?.pipeline?.include]
              .flat()
              .filter((v): v is string | RegExp => Boolean(v)),
          ],
        },
      },
    }) as unknown as Plugin[]),
    virtualPlugin,
  ];
}
