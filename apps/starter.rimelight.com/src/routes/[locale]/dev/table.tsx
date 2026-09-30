import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import TableShowcase from "../../../components/TableShowcase.tsx";

export const DevTablePage: Component = () => {
  return (
    <AppLayout
      title="Native Table Component Showcase"
      description="Testing RLTable (SolidJS reactive high-performance virtualization)"
    >
      <main class="container mx-auto px-4 py-10 flex flex-col gap-10">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight text-highlighted">
            Table Components Showcase
          </h1>
          <p class="text-sm text-muted mt-1">
            Testing native SolidJS (<code class="text-primary font-mono">RLTable.tsx</code>)
            implementation with zero TanStack dependencies.
          </p>
        </div>

        {/* SolidJS Full-Feature Matrix */}
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-emerald-500" />
            <h2 class="text-xl font-bold text-highlighted">
              SolidJS Reactive Table (<code class="text-xs font-mono">RLTable</code>)
            </h2>
          </div>
          <p class="text-xs text-muted">
            Includes sorting (shift+click for multi-sort), global live search, column visibility
            toggling, row selection, expandable sub-row inspector, category grouping, pinned
            columns, virtualization (500+ rows), and custom action dropdowns.
          </p>

          <TableShowcase />
        </section>
      </main>
    </AppLayout>
  );
};

export default DevTablePage;
