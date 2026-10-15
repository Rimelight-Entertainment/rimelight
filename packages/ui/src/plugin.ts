import UnoCSS from "@unocss/vite";
import type { Plugin, PluginOption } from "vite-plus";
import { rimelightUiPreset } from "./preset";
import { rimelightFontsVitePlugin } from "./fonts";
import { setUIConfig } from "./ui-config";
import type { UIConfig } from "./types";

export type RimelightUiPluginOptions = UIConfig;

export const VIRTUAL_ID = "virtual:rimelight-ui";
export const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}): PluginOption => {
  setUIConfig(cfg);
  const fontsOpts = cfg.fonts && typeof cfg.fonts === "object" ? cfg.fonts : undefined;
  const fontsEnabled = cfg.presets?.fonts !== false && cfg.fonts !== false;
  const fontsPlugin = fontsEnabled ? rimelightFontsVitePlugin(fontsOpts?.processorOptions) : null;

  const virtualPlugin: Plugin = {
    name: "rimelight:ui",
    enforce: "pre",
    resolveId(id) {
      if (id === VIRTUAL_ID) return RESOLVED_VIRTUAL_ID;
      return null;
    },
    load(id) {
      if (id === RESOLVED_VIRTUAL_ID) {
        return `export const config = ${JSON.stringify(cfg)};\nexport default config;`;
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
    ...(fontsPlugin ? [fontsPlugin as Plugin] : []),
    virtualPlugin,
  ];
};
