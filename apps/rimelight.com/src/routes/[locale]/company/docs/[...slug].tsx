import { type Component, Show, For, createMemo } from "solid-js";
import { useParams } from "@solidjs/router";
import DocsLayout from "#layouts/DocsLayout";
import { getDocsVersions, parseDocsSlug, extractHeadingsFromBlocks } from "@rimelight/cms";
import meta from "virtual:rimelight-ui-docs-meta";
import { generateThemeCode } from "#docs/utils";
import ComponentShowcase from "#components/ComponentShowcase";
import { BlockRenderer } from "#components/cms/PageRenderer";
import { getCurrentLocale, getLocalizedText } from "@rimelight/i18n";
import type { TableOfContentsConfig } from "@rimelight/ui/components/table-of-contents/table-of-contents.types.ts";

// Build component registry from all UI components
const componentModules: Record<string, any> = import.meta.glob(
  "../../../../../../../packages/ui/src/components/*/RL*.tsx",
  { eager: true },
);
const componentRegistry: Record<string, any> = {};
for (const [p, mod] of Object.entries(componentModules)) {
  const fileName = p.split("/").pop()?.replace(".tsx", "");
  if (fileName && (mod.default || mod[fileName])) {
    componentRegistry[fileName] = mod.default || mod[fileName];
  }
}

// Load theme modules
const themeModules: Record<string, any> = import.meta.glob(
  "../../../../../../../packages/ui/src/components/*/*.theme.ts",
  { eager: true },
);
const themeRegistry: Record<string, any> = {};
for (const [p, mod] of Object.entries(themeModules)) {
  const match = p.match(/\/([\w-]+)\/\1\.theme\.ts$/);
  if (match?.[1]) {
    const themeFn = mod.default || Object.values(mod).find((v) => typeof v === "function");
    if (themeFn) {
      themeRegistry[match[1]] = themeFn;
    }
  }
}

function generateCombinationClasses(
  themeFn: any,
  propsConfig: Record<string, string[]>,
  defaultProps: Record<string, any>,
): Record<string, any> {
  const allKeys = Object.keys(propsConfig);
  const allValues = allKeys.map((k) => propsConfig[k] || []);
  const result: Record<string, any> = {};
  let initialThemeClasses: Record<string, string> = {};

  try {
    initialThemeClasses = themeFn(defaultProps || {});
  } catch {}

  function cartesian(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const restProduct = cartesian(rest);
    return (first ?? []).flatMap((val) => restProduct.map((combo) => [val, ...combo]));
  }

  for (const combo of cartesian(allValues)) {
    const props: Record<string, any> = {};
    allKeys.forEach((k, i) => {
      props[k] = combo[i];
    });
    try {
      result[allKeys.map((k) => `${k}:${props[k]}`).join("|")] = themeFn(props);
    } catch {}
  }

  return { combinationClasses: result, initialThemeClasses };
}

function parseComponentTag(html: string): { tag: string; props: Record<string, any> } | null {
  const trimmed = html.trim();

  const parseTag = (tagHtml: string): { tag: string; props: Record<string, any> } | null => {
    const match = tagHtml.match(/^<(\w+)([\s\S]*?)(\/?)/);
    if (!match) return null;
    const tag = match[1]!;
    const attrsStr = (match[2] || "").trim();
    const props: Record<string, any> = {};

    const attrRegex = /(\w[\w-]*)(?:=(?:"([^"]*)"|{([^}]*)}|'([^']*)'))?/g;
    let attrMatch;
    while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
      const key = attrMatch[1]!;
      if (attrMatch[2] !== undefined) {
        props[key] = attrMatch[2];
      } else if (attrMatch[3] !== undefined) {
        const val = attrMatch[3]!.trim();
        if (val === "true") props[key] = true;
        else if (val === "false") props[key] = false;
        else if (/^\d+$/.test(val)) props[key] = Number(val);
        else props[key] = val!.replace(/^["']|["']$/g, "");
      } else {
        props[key] = true;
      }
    }
    return { tag, props };
  };

  const componentMatch = trimmed.match(/<(RL\w+)([\s\S]*?)(\/?)/);
  if (componentMatch) return parseTag(componentMatch[0]!);
  return parseTag(trimmed);
}

export const DocPage: Component = () => {
  const params = useParams<{ locale: string; slug?: string }>();
  const activeLocale = () => getCurrentLocale();

  const docsData = createMemo<any>(
    async () => {
      const slug = params.slug;
      try {
        const res = await fetch("/api/content/pages?type=doc");
        if (!res.ok) return null;
        const data = (await res.json()) as any;
        const allDocPages = (data.pages || []) as any[];

        const versions = getDocsVersions(allDocPages, activeLocale());
        const { activeVersion, contentPath, includeVersionInUrl } = parseDocsSlug(slug, versions);

        const candidateSlugs = [
          `${activeVersion}/${activeLocale()}/${contentPath}`,
          activeVersion
            ? `${activeVersion}/${activeLocale()}/${contentPath === "index" ? "" : contentPath}`
            : undefined,
          slug,
          contentPath === "index"
            ? activeVersion
              ? `${activeVersion}/index`
              : "index"
            : activeVersion
              ? `${activeVersion}/${contentPath}`
              : contentPath,
          contentPath,
        ].filter(Boolean) as string[];

        let dbPage = null;
        for (const candidate of candidateSlugs) {
          const match = allDocPages.find((p: any) => p.slug === candidate);
          if (match) {
            dbPage = match;
            break;
          }
        }

        return { dbPage, versions, activeVersion, contentPath, includeVersionInUrl };
      } catch {
        return null;
      }
    },
    { loadingValue: null },
  );

  const docPage = () => docsData()?.dbPage;
  const versions = () => docsData()?.versions || [];
  const activeVersion = () => docsData()?.activeVersion;
  const includeVersionInUrl = () => docsData()?.includeVersionInUrl || false;

  const content = () => {
    const p = docPage();
    if (!p) return {};
    return typeof p.content === "string" ? JSON.parse(p.content) : p.content || {};
  };

  const dbBlocks = () => {
    const blocks = content().blocks || [];
    const allMeta = meta as unknown as Record<string, any>;
    for (const block of blocks) {
      if (block.type === "ApiDocumentationBlock") {
        const compMeta = allMeta[block.props.componentName];
        if (compMeta) {
          block.props.meta = compMeta;
          if (compMeta.theme) {
            block.props.themeCode = generateThemeCode(block.props.componentName, compMeta.theme);
          }
        }
      }
    }
    return blocks;
  };

  const docTitle = () =>
    (docPage() ? getLocalizedText(docPage()!.title, activeLocale()) : "") || "Documentation";
  const docDescription = () =>
    (docPage() ? getLocalizedText(docPage()!.description, activeLocale()) : "") ||
    content().properties?.description ||
    "";
  const docHeadings = () => extractHeadingsFromBlocks(dbBlocks());
  const docTableOfContents = () =>
    content().properties?.tableOfContents as TableOfContentsConfig | false | undefined;
  const docPrev = () => content().properties?.prev;
  const docNext = () => content().properties?.next;
  const docEditUrl = () => content().properties?.editUrl;

  const getShowcaseProps = (block: any) => {
    if (
      block.type !== "ComponentShowcaseBlock" ||
      !block.props.propsConfig ||
      Object.keys(block.props.propsConfig).length === 0
    ) {
      return {};
    }
    const compKey = (block.props.componentName || "")
      .replace(/^RL[AV]/, "")
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
    const themeFn = themeRegistry[compKey];
    if (themeFn) {
      try {
        const { combinationClasses, initialThemeClasses } = generateCombinationClasses(
          themeFn,
          block.props.propsConfig,
          block.props.defaultProps || {},
        );
        const themeSlots = Object.keys(initialThemeClasses).filter(
          (k) => k !== "class" && k !== "className",
        );
        return { combinationClasses, initialThemeClasses, themeSlots };
      } catch {
        return {};
      }
    }
    return {};
  };

  const getPreviewComponent = (block: any) => {
    const raw = block.props.previewHtml || "";
    const parsed = parseComponentTag(raw);
    if (parsed) {
      const Component = componentRegistry[parsed.tag];
      return { Component, props: parsed.props, raw };
    }
    return { Component: null, props: {}, raw };
  };

  return (
    <DocsLayout
      title={docTitle()}
      description={docDescription()}
      headings={docHeadings()}
      tableOfContents={docTableOfContents()}
      prevOverride={docPrev()}
      nextOverride={docNext()}
      editUrl={docEditUrl()}
      activeVersion={activeVersion()}
      versions={versions()}
      includeVersionInUrl={includeVersionInUrl()}
    >
      <Show
        when={docPage()}
        fallback={<div class="p-12 text-center text-neutral-400">Loading documentation...</div>}
      >
        <For each={dbBlocks()}>
          {(block: any) => {
            if (block.type === "ComponentShowcaseBlock") {
              const preview = getPreviewComponent(block);
              const showcaseProps = getShowcaseProps(block);
              const Comp = preview.Component;

              return (
                <ComponentShowcase
                  componentName={block.props.componentName}
                  propsConfig={block.props.propsConfig}
                  defaultProps={block.props.defaultProps}
                  togglingPattern={block.props.togglingPattern}
                  playground={block.props.playgroundUrl}
                  {...showcaseProps}
                >
                  {Comp ? <Comp {...preview.props} /> : <div innerHTML={preview.raw} />}
                </ComponentShowcase>
              );
            }
            return <BlockRenderer block={block} locale={activeLocale()} />;
          }}
        </For>
      </Show>
    </DocsLayout>
  );
};

export default DocPage;
