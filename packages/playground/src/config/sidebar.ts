import { getCollection } from "astro:content";

export interface SidebarItem {
  label: string;
  href?: string;
  icon?: string;
  badge?: string | number;
  active?: boolean;
  children?: SidebarItem[];
}

export interface Scope {
  id: string;
  label: string;
  href: string;
}

export const scopes: Scope[] = [
  {
    id: "overview",
    label: "Overview",
    href: "/{locale}/docs/"
  },
  {
    id: "tests",
    label: "Tests",
    href: "/{locale}/docs/tests/keyboard/"
  }
];

export async function getSidebar(locale: string, currentPath: string): Promise<SidebarItem[]> {
  const docs = await getCollection("docs");
  
  const sidebarItems: SidebarItem[] = [];
  const docsBase = `/${locale}/docs`;
  const normPath = currentPath.replace(/\/$/, "").toLowerCase();
  
  // Find active scope by parsing current URL
  const activeScopeId = normPath.includes("/tests") ? "tests" : "overview";
  
  if (activeScopeId === "overview") {
    // 1. Add Home first
    sidebarItems.push({
      label: "Home",
      href: `${docsBase}/`,
      active: normPath === docsBase.toLowerCase() || normPath === `${docsBase}/index`.toLowerCase()
    });
    
    // 2. Add other top-level overview items
    const overviewDocs = docs.filter(d => d.id !== "index" && !d.id.startsWith("tests/"));
    overviewDocs.sort((a, b) => a.data.title.localeCompare(b.data.title));
    
    for (const doc of overviewDocs) {
      const href = `${docsBase}/${doc.id}/`;
      sidebarItems.push({
        label: doc.data.title,
        href,
        active: normPath === href.replace(/\/$/, "").toLowerCase()
      });
    }
  } else if (activeScopeId === "tests") {
    // For Tests scope, we list the test docs, dynamically grouped under "Testing Suite"
    const testDocs = docs.filter(d => d.id.startsWith("tests/"));
    testDocs.sort((a, b) => a.data.title.localeCompare(b.data.title));
    
    const children: SidebarItem[] = testDocs.map(doc => {
      const href = `${docsBase}/${doc.id}/`;
      return {
        label: doc.data.title,
        href,
        active: normPath === href.replace(/\/$/, "").toLowerCase()
      };
    });
    
    sidebarItems.push({
      label: "Testing Suite",
      children
    });
  }
  
  return sidebarItems;
}

export function getSurroundItems(sidebar: SidebarItem[], currentPath: string): { prev: { label: string, href: string } | null, next: { label: string, href: string } | null } {
  const flatItems: { label: string, href: string }[] = [];
  
  function flatten(items: SidebarItem[]) {
    for (const item of items) {
      if (item.href) {
        flatItems.push({ label: item.label, href: item.href });
      }
      if (item.children) {
        flatten(item.children);
      }
    }
  }
  
  flatten(sidebar);
  
  const normPath = currentPath.replace(/\/$/, "").toLowerCase();
  const currentIndex = flatItems.findIndex(item => item.href.replace(/\/$/, "").toLowerCase() === normPath);
  
  return {
    prev: currentIndex > 0 ? flatItems[currentIndex - 1] : null,
    next: currentIndex >= 0 && currentIndex < flatItems.length - 1 ? flatItems[currentIndex + 1] : null
  };
}
