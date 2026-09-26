import { type Component, For } from "solid-js"
import AppLayout from "#layouts/AppLayout"

const sections = [
  {
    title: "Component Audit Hub",
    href: "/dev/components",
    tag: "Modular Test Suite",
    description:
      "Interactive sandbox, edge-case scenarios, and quality checklists for Rimelight UI components starting with Accordion.",
    icon: "i-lucide-component"
  },
  {
    title: "Data Table Benchmark",
    href: "/dev/table",
    tag: "Data Display",
    description:
      "Benchmarking RLTable across SSR HTML streaming and SolidJS high-performance virtualization.",
    icon: "i-lucide-table"
  },
  {
    title: "OpenGraph Previewer",
    href: "/dev/og",
    tag: "SEO & Social",
    description: "Live preview and validation tool for dynamic OG banner generation.",
    icon: "i-lucide-image"
  }
]

export const DevIndexPage: Component = () => {
  return (
    <AppLayout
      title="Dev & Component Audit Suite"
      description="Development tools and testing workspace for Rimelight UI"
    >
      <main class="container mx-auto px-4 py-10 flex flex-col gap-8 max-w-5xl">
        <div class="border-b border-default pb-6">
          <h1 class="text-3xl font-black tracking-tight text-highlighted">Developer Workspace</h1>
          <p class="text-sm text-muted mt-2">
            Central hub for component auditing, runtime benchmarks, and development utilities.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <For each={sections}>
            {(s) => (
              <a
                href={s.href}
                class="flex flex-col justify-between p-6 rounded-2xl border border-default bg-elevated/20 hover:bg-elevated/40 hover:border-primary/40 transition-all group"
              >
                <div>
                  <div class="flex items-center justify-between gap-2 mb-3">
                    <div class="flex items-center gap-2">
                      <span class={`${s.icon} size-5 text-primary`} />
                      <h2 class="text-base font-bold text-highlighted group-hover:text-primary transition-colors">
                        {s.title}
                      </h2>
                    </div>
                  </div>
                  <span class="inline-block text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold mb-3">
                    {s.tag}
                  </span>
                  <p class="text-xs text-muted leading-relaxed">{s.description}</p>
                </div>
                <div class="flex items-center justify-end pt-4 border-t border-default/40 text-xs font-mono text-muted group-hover:text-primary">
                  <span class="group-hover:translate-x-1 transition-transform">Explore →</span>
                </div>
              </a>
            )}
          </For>
        </div>
      </main>
    </AppLayout>
  )
}

export default DevIndexPage
