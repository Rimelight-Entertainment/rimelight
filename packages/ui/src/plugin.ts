import type { Plugin } from "vite-plus";
import type { UIConfig } from "./types";
import UnoCSS from "@unocss/vite";
import { rimelightUiPreset } from "./preset";

const ID = "virtual:rimelight-ui";
const RESOLVED_ID = `\0${ID}`;

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}): Plugin[] => {
  const runtimeCfg: UIConfig = {
    ...(cfg.unstyled !== undefined ? { unstyled: cfg.unstyled } : {}),
    ...(cfg.colors ? { colors: cfg.colors } : {}),
    ...(cfg.icons ? { icons: cfg.icons } : {}),
    ...(cfg.shortcuts ? { shortcuts: cfg.shortcuts } : {}),
    ...(cfg.logos ? { logos: cfg.logos } : {}),
    ...(cfg.components ? { components: cfg.components } : {}),
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
    {
      name: "rimelight:ui",
      resolveId: (id) => (id === ID ? RESOLVED_ID : undefined),
      load: async (id) =>
        id === RESOLVED_ID ? `export const config = ${JSON.stringify(runtimeCfg)};` : undefined,
    },
  ];
};
