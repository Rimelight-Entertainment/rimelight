import type { PropMeta, ThemeMeta } from "@rimelight/ui/meta";

export function kebabToPascal(name: string): string {
  return name
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

export function filterProps(
  props: PropMeta[],
  options: { hide?: string[]; show?: string[] },
): PropMeta[] {
  if (options.show?.length) {
    return props.filter((p) => options.show!.includes(p.name));
  }
  if (options.hide?.length) {
    return props.filter((p) => !options.hide!.includes(p.name));
  }
  return props;
}

export function generateThemeCode(componentName: string, theme: ThemeMeta): string {
  const componentConfig: Record<string, unknown> = {
    ...(Object.keys(theme.base).length ? { base: theme.base } : {}),
    ...(Object.keys(theme.variants).length ? { variants: theme.variants } : {}),
    ...(theme.compoundVariants.length ? { compoundVariants: theme.compoundVariants } : {}),
    ...(Object.keys(theme.defaultVariants).length
      ? { defaultVariants: theme.defaultVariants }
      : {}),
  };

  return `// vite.config.ts
import { defineConfig } from "vite"
import { ui } from "@rimelight/ui/plugin"

export default defineConfig({
  plugins: [
    ui({
      components: {
        themes: {
          ${componentName}: ${JSON.stringify(componentConfig, null, 10).replace(/\n/g, "\n          ")}
        }
      }
    })
  ]
})`;
}
