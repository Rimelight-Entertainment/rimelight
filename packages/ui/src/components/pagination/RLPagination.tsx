import type { RLPaginationProps } from "./pagination.types";
import { RLPaginationTheme } from "./pagination.theme";
import { createMemo, For, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["currentPage", "page", "totalPages", "baseUrl", "onPageChange"] as const;

export const RLPagination: Component<RLPaginationProps> = (props) => {
  const { classes, rest } = RLPaginationTheme.setup(props, { omit: OMIT_KEYS });

  const currentPage = () => props.page ?? props.currentPage ?? 1;
  const totalPages = () => props.totalPages ?? 1;

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

  const itemLinkClasses = (isActive: boolean) => RLPaginationTheme({ active: isActive }).link;

  return (
    <nav class={classes().root} data-slot="pagination-root" aria-label="pagination" {...rest}>
      <ul class={classes().list} data-slot="list">
        <li class={classes().item}>
          <button
            type="button"
            class={`${classes().link} ${currentPage() === 1 ? "pointer-events-none opacity-50" : ""}`}
            aria-label="Go to previous page"
            aria-disabled={currentPage() === 1 ? "true" : "false"}
            disabled={currentPage() === 1}
            onClick={() => {
              props.onPageChange?.(currentPage() - 1);
            }}
          >
            <RLIcon name="chevron-left" size="sm" aria-hidden="true" />
          </button>
        </li>

        <For each={pageNumbers()}>
          {(p) => (
            <li class={classes().item}>
              {p === "ellipsis" ? (
                <span class={classes().ellipsis} aria-hidden="true">
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

        <li class={classes().item}>
          <button
            type="button"
            class={`${classes().link} ${currentPage() === totalPages() ? "pointer-events-none opacity-50" : ""}`}
            aria-label="Go to next page"
            aria-disabled={currentPage() === totalPages() ? "true" : "false"}
            disabled={currentPage() === totalPages()}
            onClick={() => {
              props.onPageChange?.(currentPage() + 1);
            }}
          >
            <RLIcon name="chevron-right" size="sm" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </nav>
  );
};
