import { createMemo, omit, For, type Component } from "solid-js";
import type { PaginationProps } from "./pagination";
import { paginationTheme } from "./pagination.theme";
import { RLIcon } from "../icon/RLIcon";

export interface RLPaginationProps extends PaginationProps {
  page?: number;
  onPageChange?: (page: number) => void;
}

export const RLPagination: Component<RLPaginationProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "currentPage",
    "page",
    "totalPages",
    "baseUrl",
    "onPageChange",
    "ui",
    "class",
  );

  const currentPage = () => props.page ?? props.currentPage ?? 1;
  const totalPages = () => props.totalPages ?? 1;

  const resolvedClasses = createMemo(() =>
    paginationTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  const pageNumbers = createMemo<(number | "ellipsis")[]>(() => {
    const total = totalPages();
    const current = currentPage();
    const pages: (number | "ellipsis")[] = [];
    const maxVisible = 5;
    if (total <= maxVisible) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("ellipsis");
      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (current < total - 2) pages.push("ellipsis");
      if (!pages.includes(total)) pages.push(total);
    }
    return pages;
  });

  const itemLinkClasses = (isActive: boolean) => paginationTheme({ active: isActive }).link;

  return (
    <nav
      class={resolvedClasses().root}
      data-slot="pagination-root"
      aria-label="pagination"
      {...rest}
    >
      <ul class={resolvedClasses().list} data-slot="list">
        <li class={resolvedClasses().item}>
          <button
            type="button"
            class={`${resolvedClasses().link} ${currentPage() === 1 ? "pointer-events-none opacity-50" : ""}`}
            aria-label="Go to previous page"
            aria-disabled={currentPage() === 1 ? "true" : "false"}
            disabled={currentPage() === 1}
            onClick={() => {
              props.onPageChange?.(currentPage() - 1);
            }}
          >
            <RLIcon name="chevronLeft" size="sm" aria-hidden="true" />
          </button>
        </li>

        <For each={pageNumbers()}>
          {(p) => (
            <li class={resolvedClasses().item}>
              {p === "ellipsis" ? (
                <span class={resolvedClasses().ellipsis} aria-hidden="true">
                  &hellip;
                </span>
              ) : (
                <button
                  type="button"
                  class={itemLinkClasses(p === currentPage())}
                  aria-current={p === currentPage() ? "page" : undefined}
                  onClick={() => {
                    if (typeof p === "number") props.onPageChange?.(p);
                  }}
                >
                  {p}
                </button>
              )}
            </li>
          )}
        </For>

        <li class={resolvedClasses().item}>
          <button
            type="button"
            class={`${resolvedClasses().link} ${currentPage() === totalPages() ? "pointer-events-none opacity-50" : ""}`}
            aria-label="Go to next page"
            aria-disabled={currentPage() === totalPages() ? "true" : "false"}
            disabled={currentPage() === totalPages()}
            onClick={() => {
              props.onPageChange?.(currentPage() + 1);
            }}
          >
            <RLIcon name="chevronRight" size="sm" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
