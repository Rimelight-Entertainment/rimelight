import type { RLBreadcrumbProps } from "./breadcrumb.types";
import { RLBreadcrumbTheme } from "./breadcrumb.theme";
import { createMemo, omit, For, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";
import { resolveLinkAttrs } from "../link/helpers";

interface VisibleItemEntry {
  item: any;
  originalIndex: number;
  isLast: boolean;
  isFirst: boolean;
  isOverflow: boolean;
  hiddenCount?: number | undefined;
}

export const RLBreadcrumb: Component<RLBreadcrumbProps<any>> = (props) => {
  const rest = omit(
    props,
    "as",
    "items",
    "separatorIcon",
    "color",
    "labelKey",
    "maxVisible",
    "estimatedItemWidth",
    "ui",
    "class",
    "children",
    "separator",
    "itemSlot",
    "itemLeadingSlot",
    "itemLabelSlot",
    "itemTrailingSlot",
    "separatorSlot",
    "slots",
  );

  const RootTag = dynamic(() => props.as ?? "nav");

  const allItems = () => (Array.isArray(props.items) ? props.items : []);
  const count = () => allItems().length;

  const resolvedColor = () => props.color ?? "primary";
  const labelKey = () => props.labelKey ?? "label";

  const getItemLabel = (item: any): string => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      const val = item[labelKey()];
      if (val !== undefined && val !== null) return String(val);
      if (item.label !== undefined && item.label !== null) return String(item.label);
    }
    return "";
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
        isFirst: idx === 0,
        isOverflow: false,
      }));
    }

    const max = props.maxVisible!;
    const insideCount = max - 2;
    const result: VisibleItemEntry[] = [];

    // First item
    result.push({
      item: items[0],
      originalIndex: 0,
      isLast: total === 1,
      isFirst: true,
      isOverflow: false,
    });

    const hiddenCount = total - 1 - insideCount - 1;

    // Overflow item
    result.push({
      item: { label: "…" },
      originalIndex: 1,
      isLast: false,
      isFirst: false,
      isOverflow: true,
      hiddenCount,
    });

    // Inside items (trailing before last)
    const trailingStartIndex = total - 1 - insideCount;
    for (let i = trailingStartIndex; i < total - 1; i++) {
      result.push({
        item: items[i],
        originalIndex: i,
        isLast: false,
        isFirst: false,
        isOverflow: false,
      });
    }

    // Last item
    if (total > 1) {
      result.push({
        item: items[total - 1],
        originalIndex: total - 1,
        isLast: true,
        isFirst: false,
        isOverflow: false,
      });
    }

    return result;
  });

  const getThemeClasses = (item: any, isLast: boolean) => {
    const hasTo = Boolean(item && item.href);
    const active = item?.active !== undefined ? Boolean(item.active) : isLast;
    const disabled = Boolean(item?.disabled);

    const baseClasses = createMemo(() =>
      RLBreadcrumbTheme({
        color: resolvedColor(),
        active,
        disabled,
        to: hasTo,
        ui:
          item?.ui || item?.class
            ? {
                ...props.ui,
                ...item?.ui,
                ...(item?.class ? { link: [props.ui?.link, item?.ui?.link, item.class] } : {}),
              }
            : props.ui,
        class: props.class,
      }),
    );

    return {
      active,
      disabled,
      hasTo,
      classes: baseClasses,
    };
  };

  const renderSeparator = (item?: any, idx?: number) => {
    const themeClasses = createMemo(() =>
      RLBreadcrumbTheme({
        color: resolvedColor(),
        ui: item?.ui ? { ...props.ui, ...item.ui } : props.ui,
        class: props.class,
      }),
    );

    if (props.separatorSlot) {
      return (
        <span class={themeClasses().separator} data-slot="separator" aria-hidden="true">
          {props.separatorSlot({ item, index: idx })}
        </span>
      );
    }

    if (props.separator !== undefined && props.separator !== null) {
      return (
        <span class={themeClasses().separator} data-slot="separator" aria-hidden="true">
          {props.separator}
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

  const renderItemContent = (
    item: any,
    index: number,
    theme: () => ReturnType<typeof getThemeClasses>,
  ) => {
    const active = () => theme().active;
    const disabled = () => theme().disabled;
    const hasTo = () => theme().hasTo;
    const classes = () => theme().classes();

    const customSlotName = item?.slot;
    if (customSlotName && props.slots && props.slots[customSlotName]) {
      return props.slots[customSlotName]!({ item, index, active: active() });
    }

    if (props.itemSlot) {
      return props.itemSlot({ item, index, active: active() });
    }

    const labelText = () => getItemLabel(item);

    const leadingSlot =
      (customSlotName && props.slots && props.slots[`${customSlotName}-leading`]) ||
      props.itemLeadingSlot;
    const labelSlot =
      (customSlotName && props.slots && props.slots[`${customSlotName}-label`]) ||
      props.itemLabelSlot;
    const trailingSlot =
      (customSlotName && props.slots && props.slots[`${customSlotName}-trailing`]) ||
      props.itemTrailingSlot;

    const renderLeading = () => {
      if (leadingSlot) {
        return leadingSlot({ item, index, active: active() });
      }

      if (item?.avatar) {
        const avatarProps = typeof item.avatar === "object" ? item.avatar : { src: item.avatar };
        return (
          <span class={classes().linkLeadingAvatar} data-slot="link-leading-avatar">
            <RLAvatar
              size={item?.ui?.linkLeadingAvatarSize ?? props.ui?.linkLeadingAvatarSize ?? "3xs"}
              {...avatarProps}
            />
          </span>
        );
      }

      if (item?.icon) {
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
        return labelSlot({ item, index, active: active() });
      }

      return (
        <span class={classes().linkLabel} data-slot="link-label">
          {labelText()}
        </span>
      );
    };

    const renderTrailing = () => {
      if (trailingSlot) {
        return trailingSlot({ item, index, active: active() });
      }
      return null;
    };

    const content = (
      <>
        {renderLeading()}
        {renderLabel()}
        {renderTrailing()}
      </>
    );

    const itemLinkClass = () => classes().link;

    if (hasTo()) {
      const linkAttrs = () =>
        resolveLinkAttrs({
          href: item.href,
          target: item.target,
          rel: item.rel,
          external: item.external,
          disabled: disabled(),
          active: active(),
          ariaLabel: item.ariaLabel || item["aria-label"],
          ariaCurrentValue: active() ? "page" : undefined,
        });

      return (
        <a
          class={itemLinkClass()}
          data-slot="link"
          href={linkAttrs().href}
          target={linkAttrs().target}
          rel={linkAttrs().rel}
          aria-label={item.ariaLabel || item["aria-label"]}
          aria-current={active() ? "page" : undefined}
          aria-disabled={disabled() ? "true" : undefined}
          tabindex={disabled() ? -1 : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <span class={itemLinkClass()} data-slot="link" aria-current={active() ? "page" : undefined}>
        {content}
      </span>
    );
  };

  const rootClasses = createMemo(() =>
    RLBreadcrumbTheme({
      color: resolvedColor(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const overflowThemeClasses = createMemo(() =>
    RLBreadcrumbTheme({
      color: resolvedColor(),
      ui:
        props.ui?.overflow === undefined && props.ui?.item !== undefined
          ? { ...props.ui, overflow: props.ui.item }
          : props.ui,
      class: props.class,
    }),
  );

  return (
    <RootTag aria-label="Breadcrumb" class={rootClasses().root} data-slot="root" {...rest}>
      <ol class={rootClasses().list} data-slot="list">
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

              const theme = () => getThemeClasses(item, isLast);
              return (
                <li class={theme().classes().item} data-slot="item">
                  {renderItemContent(item, originalIndex, theme)}
                  {!isLast && renderSeparator(item, originalIndex)}
                </li>
              );
            }}
          </For>
        ) : (
          props.children
        )}
      </ol>
    </RootTag>
  );
};
