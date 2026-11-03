import type { BreadcrumbItem, BreadcrumbUI, RLBreadcrumbProps } from "./breadcrumb.types";
import { RLBreadcrumbTheme, type RLBreadcrumbClasses } from "./breadcrumb.theme";
import { createMemo, For, type Accessor, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";
import { resolveLinkAttrs } from "../link/helpers";
import { uiT } from "../../locale";
import type { SlotRenderer } from "../../types";

const OMIT_KEYS = ["items", "separatorIcon", "labelKey", "maxVisible"] as const;

interface VisibleItemEntry {
  item: BreadcrumbItem;
  originalIndex: number;
  isLast: boolean;
  isOverflow: boolean;
  hiddenCount?: number | undefined;
}

interface ItemTheme {
  active: boolean;
  disabled: boolean;
  hasTo: boolean;
  classes: Accessor<RLBreadcrumbClasses>;
}

const renderSlot = <C,>(renderer: SlotRenderer<C>, ctx: C) =>
  typeof renderer === "function" ? renderer(ctx) : renderer;

export const RLBreadcrumb: Component<RLBreadcrumbProps> = (props) => {
  const { Tag, classes, rest, slots, children, ui, theme } = RLBreadcrumbTheme.setup(props, {
    as: "nav",
    omit: OMIT_KEYS,
    slots: [
      "itemSlot",
      "itemLeadingSlot",
      "itemLabelSlot",
      "itemTrailingSlot",
      "separatorSlot",
    ] as const,
  });

  const allItems = () => props.items ?? [];
  const count = () => allItems().length;

  const getItemLabel = (item: BreadcrumbItem): string => {
    const val = (item as Record<string, unknown>)[props.labelKey ?? "label"] ?? item.label;
    return typeof val === "string" || typeof val === "number" ? String(val) : "";
  };

  const hasOverflow = () =>
    props.maxVisible !== undefined &&
    props.maxVisible > 0 &&
    count() > props.maxVisible &&
    count() > 2;

  const visibleItemsWithMeta = createMemo<VisibleItemEntry[]>(() => {
    const items = allItems();
    const total = items.length;
    if (total === 0) return [];

    if (!hasOverflow()) {
      return items.map((item, idx) => ({
        item,
        originalIndex: idx,
        isLast: idx === total - 1,
        isOverflow: false,
      }));
    }

    const max = props.maxVisible!;
    const insideCount = max - 2;
    const result: VisibleItemEntry[] = [];

    // First item
    result.push({
      item: items[0]!,
      originalIndex: 0,
      isLast: total === 1,
      isOverflow: false,
    });

    const hiddenCount = total - 1 - insideCount - 1;

    // Overflow item
    result.push({
      item: { label: "…" },
      originalIndex: 1,
      isLast: false,
      isOverflow: true,
      hiddenCount,
    });

    // Inside items (trailing before last)
    const trailingStartIndex = total - 1 - insideCount;
    for (let i = trailingStartIndex; i < total - 1; i++) {
      result.push({
        item: items[i]!,
        originalIndex: i,
        isLast: false,
        isOverflow: false,
      });
    }

    // Last item
    if (total > 1) {
      result.push({
        item: items[total - 1]!,
        originalIndex: total - 1,
        isLast: true,
        isOverflow: false,
      });
    }

    return result;
  });

  // Per-item slot overrides: the item's own `ui` and `class` extend the component `ui`.
  const itemUi = (item: BreadcrumbItem): BreadcrumbUI | undefined => {
    const base = ui();
    if (!item.ui && !item.class) return base;
    return {
      ...base,
      ...item.ui,
      ...(item.class ? { link: [base?.link, item.ui?.link, item.class] } : {}),
    };
  };

  const getThemeClasses = (item: BreadcrumbItem, isLast: boolean): ItemTheme => {
    const hasTo = Boolean(item.href);
    const active = item.active !== undefined ? Boolean(item.active) : isLast;
    const disabled = Boolean(item.disabled);

    return {
      active,
      disabled,
      hasTo,
      classes: createMemo(() =>
        RLBreadcrumbTheme({
          color: props.color,
          active,
          disabled,
          to: hasTo,
          ui: itemUi(item),
        }),
      ),
    };
  };

  const renderSeparator = (item?: BreadcrumbItem, index?: number) => {
    const themeClasses = createMemo(() =>
      RLBreadcrumbTheme({
        color: props.color,
        ui: item?.ui ? { ...ui(), ...item.ui } : ui(),
      }),
    );

    const separatorRenderer = slots.separatorSlot();
    if (separatorRenderer !== undefined) {
      return (
        <span class={themeClasses().separator} data-slot="separator" aria-hidden="true">
          {renderSlot(separatorRenderer, { item, index })}
        </span>
      );
    }

    const iconName = () => props.separatorIcon ?? "chevron-right";

    return (
      <span class={themeClasses().separator} data-slot="separator" aria-hidden="true">
        <span class={themeClasses().separatorIcon} data-slot="separator-icon">
          <RLIcon name={iconName()} aria-hidden="true" />
        </span>
      </span>
    );
  };

  const renderItemContent = (item: BreadcrumbItem, index: number, theme: ItemTheme) => {
    const active = theme.active;
    const disabled = theme.disabled;
    const classes = createMemo(() => theme.classes());
    const ctx = { item, index, active };

    const itemRenderer = slots.itemSlot();
    if (itemRenderer) {
      return renderSlot(itemRenderer, ctx);
    }

    const leadingSlot = slots.itemLeadingSlot();
    const labelSlot = slots.itemLabelSlot();
    const trailingSlot = slots.itemTrailingSlot();

    const renderLeading = () => {
      if (leadingSlot) {
        return renderSlot(leadingSlot, ctx);
      }

      if (item.avatar) {
        const avatarProps = typeof item.avatar === "object" ? item.avatar : { src: item.avatar };
        return (
          <span class={classes().linkLeadingAvatar} data-slot="link-leading-avatar">
            <RLAvatar size="xs" {...avatarProps} />
          </span>
        );
      }

      if (item.icon) {
        return (
          <span class={classes().linkLeadingIcon} data-slot="link-leading-icon">
            <RLIcon name={item.icon} aria-hidden="true" />
          </span>
        );
      }

      return null;
    };

    const renderLabel = () => {
      if (labelSlot) {
        return renderSlot(labelSlot, ctx);
      }

      return (
        <span class={classes().linkLabel} data-slot="link-label">
          {getItemLabel(item)}
        </span>
      );
    };

    const renderTrailing = () => (trailingSlot ? renderSlot(trailingSlot, ctx) : null);

    const content = (
      <>
        {renderLeading()}
        {renderLabel()}
        {renderTrailing()}
      </>
    );

    if (theme.hasTo) {
      const linkAttrs = resolveLinkAttrs({
        href: item.href,
        target: item.target,
        rel: item.rel,
        external: item.external,
        disabled,
        active,
      });

      return (
        <a
          class={classes().link}
          data-slot="link"
          href={linkAttrs.href}
          target={linkAttrs.target}
          rel={linkAttrs.rel}
          aria-label={item["aria-label"]}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled ? "true" : undefined}
          tabindex={disabled ? -1 : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <span class={classes().link} data-slot="link" aria-current={active ? "page" : undefined}>
        {content}
      </span>
    );
  };

  const overflowThemeClasses = createMemo(() => {
    const u = ui();
    return RLBreadcrumbTheme({
      color: props.color,
      ui: u?.overflow === undefined && u?.item !== undefined ? { ...u, overflow: u.item } : u,
    });
  });

  return (
    <Tag
      aria-label={uiT("breadcrumb.label")}
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      {...rest}
    >
      <ol class={classes().list} data-slot="list">
        {props.items ? (
          <For each={visibleItemsWithMeta()}>
            {({ item, originalIndex, isLast, isOverflow, hiddenCount }) => {
              if (isOverflow) {
                return (
                  <li
                    class={overflowThemeClasses().overflow}
                    aria-hidden="true"
                    data-slot="overflow"
                  >
                    <span
                      class={overflowThemeClasses().overflowEllipsis}
                      data-slot="overflow-ellipsis"
                    >
                      …
                    </span>
                    <span class={overflowThemeClasses().overflowCount} data-slot="overflow-count">
                      +{hiddenCount}
                    </span>
                    {renderSeparator()}
                  </li>
                );
              }

              const itemTheme = getThemeClasses(item, isLast);
              return (
                <li class={itemTheme.classes().item} data-slot="item">
                  {renderItemContent(item, originalIndex, itemTheme)}
                  {!isLast && renderSeparator(item, originalIndex)}
                </li>
              );
            }}
          </For>
        ) : (
          children()
        )}
      </ol>
    </Tag>
  );
};
