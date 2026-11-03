import type { RLPaginationProps } from "./pagination.types";
import { RLPaginationTheme } from "./pagination.theme";
import { createMemo, For, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { createControllable } from "../../controllable";

const OMIT_KEYS = ["page", "defaultPage", "totalPages", "onPageChange"] as const;

export const RLPagination: Component<RLPaginationProps> = (props) => {
  const { Tag, classes, rest, theme } = RLPaginationTheme.setup(props, {
    as: "nav",
    omit: OMIT_KEYS,
  });

  const [currentPage, setCurrentPage] = createControllable(
    () => props.page,
    props.defaultPage ?? 1,
    props.onPageChange,
  );
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
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      aria-label={uiT("pagination.label")}
      {...rest}
    >
      <ul class={classes().list} data-slot="list">
        <li class={classes().item} data-slot="item">
          <button
            type="button"
            class={`${classes().link} ${currentPage() === 1 ? "pointer-events-none opacity-50" : ""}`}
            aria-label={uiT("pagination.previous")}
            aria-disabled={currentPage() === 1 ? "true" : "false"}
            disabled={currentPage() === 1}
            onClick={() => setCurrentPage(currentPage() - 1)}
          >
            <RLIcon name="chevron-left" size="sm" aria-hidden="true" />
          </button>
        </li>

        <For each={pageNumbers()}>
          {(p) => (
            <li class={classes().item} data-slot="item">
              {p === "ellipsis" ? (
                <span class={classes().ellipsis} data-slot="ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              ) : (
                <button
                  type="button"
                  class={itemLinkClasses(p === currentPage())}
                  aria-current={p === currentPage() ? "page" : undefined}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )}
            </li>
          )}
        </For>

        <li class={classes().item} data-slot="item">
          <button
            type="button"
            class={`${classes().link} ${currentPage() === totalPages() ? "pointer-events-none opacity-50" : ""}`}
            aria-label={uiT("pagination.next")}
            aria-disabled={currentPage() === totalPages() ? "true" : "false"}
            disabled={currentPage() === totalPages()}
            onClick={() => setCurrentPage(currentPage() + 1)}
          >
            <RLIcon name="chevron-right" size="sm" aria-hidden="true" />
          </button>
        </li>
      </ul>
    </Tag>
  );
};
