export interface DocEntry {
  id?: string;
  slug?: string;
  version?: string;
  properties?: Record<string, any>;
  [key: string]: any;
}

export function getDocsVersions(entries: (DocEntry | string)[], locale?: string): string[] {
  const versions = new Set<string>();
  for (const entry of entries) {
    if (typeof entry === "string") {
      const parts = entry.replace(/\\/g, "/").split("/");
      if (parts[0]?.startsWith("v")) {
        versions.add(parts[0]);
      }
      continue;
    }

    if (entry.version && entry.version.startsWith("v")) {
      versions.add(entry.version);
      continue;
    }

    if (entry.properties?.["version"] && String(entry.properties["version"]).startsWith("v")) {
      versions.add(String(entry.properties["version"]));
      continue;
    }

    const path = (entry.slug || entry.id || "").replace(/\\/g, "/");
    const parts = path.split("/");
    if (locale && parts[1] === locale && parts[0]?.startsWith("v")) {
      versions.add(parts[0]);
    } else if (parts[0]?.startsWith("v")) {
      versions.add(parts[0]);
    }
  }
  return Array.from(versions).toSorted((a, b) => {
    return b.localeCompare(a, undefined, { numeric: true, sensitivity: "base" });
  });
}

export interface ParsedDocsSlug {
  activeVersion: string | undefined;
  contentPath: string;
  includeVersionInUrl: boolean;
}

export function parseDocsSlug(slug: string | undefined, versions: string[]): ParsedDocsSlug {
  if (versions.length === 0) {
    return {
      activeVersion: "",
      contentPath: slug || "index",
      includeVersionInUrl: false,
    };
  }

  const defaultVersion = versions[0];
  const isMultiVersion = versions.length > 1;

  if (!slug) {
    return {
      activeVersion: defaultVersion,
      contentPath: "index",
      includeVersionInUrl: isMultiVersion,
    };
  }

  const parts = slug.split("/");
  const firstPart = parts[0];

  if (firstPart && versions.includes(firstPart)) {
    return {
      activeVersion: firstPart,
      contentPath: parts.slice(1).join("/") || "index",
      includeVersionInUrl: isMultiVersion,
    };
  }

  return {
    activeVersion: defaultVersion,
    contentPath: slug || "index",
    includeVersionInUrl: isMultiVersion,
  };
}

export function formatDocsUrl(
  href: string,
  locale: string,
  activeVersion?: string,
  includeVersionInUrl?: boolean,
): string {
  let url = href.replace("{locale}", locale);
  if (activeVersion && includeVersionInUrl) {
    if (url.includes(`/${activeVersion}/`) || url.endsWith(`/${activeVersion}`)) {
      return url;
    }
    const docsPattern = new RegExp(`(/${locale}/docs)(/|$)`);
    const companyDocsPattern = new RegExp(`(/${locale}/company/docs)(/|$)`);

    if (companyDocsPattern.test(url)) {
      url = url.replace(companyDocsPattern, `$1/${activeVersion}$2`);
    } else if (docsPattern.test(url)) {
      url = url.replace(docsPattern, `$1/${activeVersion}$2`);
    }

    url = url.replace(/\/{2,}/g, "/");
  }
  return url;
}
