import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLPagination } from "@rimelight/ui/components/pagination/RLPagination.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const PaginationSandbox = (): JSX.Element => {
  const [page, setPage] = createSignal(1);
  const [totalPages, setTotalPages] = createSignal(12);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <button type="button" onClick={() => setTotalPages(3)}>
          totalPages: 3
        </button>
        <button type="button" onClick={() => setTotalPages(12)}>
          totalPages: 12
        </button>
        <button type="button" onClick={() => setPage(1)}>
          reset page
        </button>
        <span>current page: {page()}</span>
      </div>
      <RLPagination page={page()} totalPages={totalPages()} onValueChange={setPage} />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "uncontrolled",
    title: "Uncontrolled (defaultPage)",
    description: "defaultPage sets the starting page. Clicks update internal state.",
    render: () => <RLPagination defaultPage={3} totalPages={8} />,
  },
  {
    id: "controlled",
    title: "Controlled (page + onValueChange)",
    description: "page is driven by the parent; onValueChange reports each new page.",
    render: () => {
      const [page, setPage] = createSignal(2);
      return (
        <div class="flex flex-col gap-2">
          <span>page: {page()}</span>
          <RLPagination page={page()} totalPages={6} onValueChange={setPage} />
        </div>
      );
    },
  },
  {
    id: "ellipsis",
    title: "Ellipsis (more than five pages)",
    description: "Ellipsis appears between page numbers when totalPages is greater than 5.",
    render: () => <RLPagination defaultPage={10} totalPages={20} />,
  },
  {
    id: "small-range",
    title: "Small range (no ellipsis)",
    description: "Five or fewer pages render every page number without ellipsis.",
    render: () => <RLPagination defaultPage={1} totalPages={5} />,
  },
  {
    id: "single-page",
    title: "Single page (default totalPages)",
    description: "totalPages defaults to 1; previous and next are both disabled.",
    render: () => <RLPagination />,
  },
];

export const paginationAudit: ComponentAuditDefinition = {
  id: "pagination",
  name: "Pagination",
  category: "Navigation",
  status: "Auditing",
  description: "Page navigation with previous and next buttons, page numbers, and ellipsis.",
  importPath: "@rimelight/ui/components/pagination/RLPagination.tsx",
  renderSandbox: () => <PaginationSandbox />,
  testScenarios,
};
