import { type Component } from "solid-js";
import DevLayout from "#layouts/DevLayout";
import TableShowcase from "../../../components/dev/TableShowcase.tsx";

export const DevTablePage: Component = () => {
  return (
    <DevLayout
      title="Data Table Benchmark"
      description="Testing RLTable (SolidJS reactive high-performance virtualization, multi-sort, and filtering)"
      currentSection="table"
      maxWidth="7xl"
    >
      <div class="flex flex-col gap-6">
        <div class="border-b border-default pb-4">
          <h1 class="text-3xl font-extrabold tracking-tight text-highlighted">
            Table Component Benchmark & Showcase
          </h1>
          <p class="text-sm text-muted mt-1">
            Testing native SolidJS (<code class="text-primary font-mono">RLTable.tsx</code>)
            implementation with zero external runtime dependencies.
          </p>
        </div>

        <TableShowcase />
      </div>
    </DevLayout>
  );
};

export default DevTablePage;
