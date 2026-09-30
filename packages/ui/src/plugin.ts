import UnoCSS from "@unocss/vite";
import type { Plugin } from "vite-plus";
import rimelightUiPreset from "./preset";
import { rimelightFontsVitePlugin } from "./fonts";
import type { UIConfig } from "./types";

const ID = "virtual:rimelight/ui";

export type RimelightUIPlugin = Plugin;

export type RimelightUIPlugins = Plugin[];

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}): RimelightUIPlugins => {
  const fontsOpts = cfg.fonts && typeof cfg.fonts === "object" ? cfg.fonts : undefined;
  const fontsEnabled = cfg.presets?.fonts !== false && cfg.fonts !== false;
  const fontsPlugin = fontsEnabled ? rimelightFontsVitePlugin(fontsOpts?.processorOptions) : null;

  return [
    ...(UnoCSS({
      ...unocss,
      presets: [rimelightUiPreset(cfg), ...(unocss.presets || [])],
      content: {
        ...unocss.content,
        pipeline: unocss.content?.pipeline !== false && {
          ...unocss.content?.pipeline,
          include: [
            /\.(svelte|[jt]sx?|mdx?|astro|html)($|\?)/,
            /[\\/](@rimelight\/(ui|cms)|packages\/(ui|cms))[\\/]/,
            ...[unocss.content?.pipeline?.include]
              .flat()
              .filter((v): v is string | RegExp => Boolean(v)),
          ],
        },
      },
    }) as unknown as Plugin[]),
    ...(fontsPlugin ? [fontsPlugin as Plugin] : []),
    {
      name: "rimelight/ui",
      enforce: "pre",
      resolveId: (id: string) => (id === ID ? `\0${ID}` : null),
      load: (id: string) => (id === `\0${ID}` ? `export default ${JSON.stringify(cfg)};` : null),
    },
  ];
};

export default ui;
