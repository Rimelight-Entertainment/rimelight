import UnoCSS from "@unocss/vite";
import type { Plugin, PluginOption } from "vite-plus";
import { rimelightUiPreset } from "./preset";
// Must import setUIConfig from "./ui-config", NEVER from "./resolver".
// Loading vite.config.ts in Node (e.g. during vp staged / git hooks) executes this file.
// If imported from resolver, Node's ESM loader immediately encounters `import "virtual:rimelight-ui"`
// and throws ERR_UNSUPPORTED_ESM_URL_SCHEME.
import { setUIConfig } from "./ui-config";
import type { UIConfig } from "./types";

export type RimelightUiPluginOptions = UIConfig;

export const VIRTUAL_ID = "virtual:rimelight-ui";
export const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_ID}`;

export const ui = ({ unocss = {}, ...cfg }: UIConfig = {}): PluginOption => {
  setUIConfig(cfg);

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
    virtualPlugin,
  ];
};
