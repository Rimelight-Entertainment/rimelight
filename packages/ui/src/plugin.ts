import UnoCSS from "@unocss/vite";
import type { Plugin, PluginOption } from "vite-plus";
import { defineRimelightArtifactPlugin } from "@rimelight/config";
import { rimelightUiPreset } from "./preset";
import { rimelightFontsVitePlugin } from "./fonts";
import type { UIConfig } from "./types";

export type RimelightUiPlugin = PluginOption;
export type RimelightUiPluginOptions = UIConfig;

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}): PluginOption => {
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
    defineRimelightArtifactPlugin({
      pkgName: "ui",
      config: cfg,
    }),
  ];
};
