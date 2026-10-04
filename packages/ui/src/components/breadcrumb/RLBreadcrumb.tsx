import { createMemo, omit, For, type Component } from "solid-js";
import { dynamic, type JSX } from "@solidjs/web";
import type { BreadcrumbItem, BreadcrumbProps } from "./breadcrumb";
import { breadcrumbTheme } from "./breadcrumb.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";
import { resolveLinkAttrs } from "../link/helpers";
import { cx } from "../../resolver";

export interface RLBreadcrumbProps<T = BreadcrumbItem> extends BreadcrumbProps<T> {
  children?: JSX.Element;
  separator?: JSX.Element;
  itemSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  itemLeadingSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  itemLabelSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  itemTrailingSlot?: (props: { item: T; index: number; active: boolean }) => JSX.Element;
  separatorSlot?: (props: { item?: T | undefined; index?: number | undefined }) => JSX.Element;
  slots?:
    | Record<string, (props: { item: T; index: number; active: boolean }) => JSX.Element>
    | undefined;
}

interface VisibleItemEntry {
  item: any;
  originalIndex: number;
  isLast: boolean;
  isFirst: boolean;
  isOverflow: boolean;
  hiddenCount?: number | undefined;
}

const RLBreadcrumb: Component<RLBreadcrumbProps<any>> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
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
    const startItemsCount = 1;
    const endItemsCount = 1;
    const availableMiddle = Math.max(0, max - (startItemsCount + endItemsCount));

    const first = items[0]!;
    const last = items[total - 1]!;
    const middleItems = items.slice(1, total - 1);
    const visibleMiddle = middleItems.slice(middleItems.length - availableMiddle);
    const hiddenCount = middleItems.length - visibleMiddle.length;

    const result: VisibleItemEntry[] = [];

    result.push({
      item: first,
      originalIndex: 0,
      isLast: total === 1,
      isFirst: true,
      isOverflow: false,
    });

    if (hiddenCount > 0) {
      result.push({
        item: null,
        originalIndex: 1,
        isLast: false,
        isFirst: false,
        isOverflow: true,
        hiddenCount,
      });
    }

    for (let i = 0; i < visibleMiddle.length; i++) {
      const idx = total - 1 - visibleMiddle.length + i;
      result.push({
        item: visibleMiddle[i],
        originalIndex: idx,
        isLast: false,
        isFirst: false,
        isOverflow: false,
      });
    }

    if (total > 1) {
      result.push({
        item: last,
        originalIndex: total - 1,
        isLast: true,
        isFirst: false,
        isOverflow: false,
      });
    }

    return result;
  });

  const getThemeClasses = (item: any, isLast: boolean) => {
    const hasTo = Boolean(item && (item.to || item.href));
    const active = item?.active !== undefined ? Boolean(item.active) : isLast;
    const disabled = Boolean(item?.disabled);

    const baseClasses = breadcrumbTheme({
      color: resolvedColor(),
      active,
      disabled,
      to: hasTo,
      ui: props.ui,
      class: props.class,
    });

    return {
      active,
      disabled,
      hasTo,
      classes: baseClasses,
    };
  };

  const renderSeparator = (item?: any, idx?: number) => {
    const themeClasses = breadcrumbTheme({
      color: resolvedColor(),
      ui: props.ui,
      class: props.class,
    });

    if (props.separatorSlot) {
      return (
        <span
          class={cx(themeClasses.separator, props.ui?.separator, item?.ui?.separator)}
          data-slot="separator"
          aria-hidden="true"
        >
          {props.separatorSlot({ item, index: idx })}
        </span>
      );
    }

    if (props.separator !== undefined && props.separator !== null) {
      return (
        <span
          class={cx(themeClasses.separator, props.ui?.separator, item?.ui?.separator)}
          data-slot="separator"
          aria-hidden="true"
        >
          {props.separator}
        </span>
      );
    }

    const iconName = props.separatorIcon ?? "chevronRight";

    return (
      <span
        class={cx(themeClasses.separator, props.ui?.separator, item?.ui?.separator)}
        data-slot="separator"
        aria-hidden="true"
      >
        <span
          class={cx(themeClasses.separatorIcon, props.ui?.separatorIcon, item?.ui?.separatorIcon)}
          data-slot="separator-icon"
        >
          <RLIcon name={iconName} aria-hidden="true" />
        </span>
      </span>
    );
  };

  const renderItemContent = (item: any, index: number, isLast: boolean) => {
    const { active, disabled, hasTo, classes } = getThemeClasses(item, isLast);

    const customSlotName = item?.slot;
    if (customSlotName && props.slots && props.slots[customSlotName]) {
      return props.slots[customSlotName]!({ item, index, active });
    }

    if (props.itemSlot) {
      return props.itemSlot({ item, index, active });
    }

    const labelText = getItemLabel(item);

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
        return leadingSlot({ item, index, active });
      }

      if (item?.avatar) {
        const avatarProps = typeof item.avatar === "object" ? item.avatar : { src: item.avatar };
        return (
          <span
            class={cx(
              classes.linkLeadingAvatar,
              props.ui?.linkLeadingAvatar,
              item?.ui?.linkLeadingAvatar,
            )}
            data-slot="link-leading-avatar"
          >
            <RLAvatar
              size={item?.ui?.linkLeadingAvatarSize ?? props.ui?.linkLeadingAvatarSize ?? "3xs"}
              {...avatarProps}
            />
          </span>
        );
      }

      if (item?.icon) {
        return (
          <span
            class={cx(
              classes.linkLeadingIcon,
              props.ui?.linkLeadingIcon,
              item?.ui?.linkLeadingIcon,
            )}
            data-slot="link-leading-icon"
          >
            <RLIcon name={item.icon} aria-hidden="true" />
          </span>
        );
      }

      return null;
    };

    const renderLabel = () => {
      if (labelSlot) {
        return labelSlot({ item, index, active });
      }

      return (
        <span
          class={cx(classes.linkLabel, props.ui?.linkLabel, item?.ui?.linkLabel)}
          data-slot="link-label"
        >
          {labelText}
        </span>
      );
    };

    const renderTrailing = () => {
      if (trailingSlot) {
        return trailingSlot({ item, index, active });
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

    const itemLinkClass = cx(classes.link, props.ui?.link, item?.ui?.link, item?.class);

    if (hasTo) {
      const linkAttrs = resolveLinkAttrs({
        to: item.to,
        href: item.href ?? item.to,
        target: item.target,
        rel: item.rel,
        external: item.external,
        disabled,
        active,
        ariaLabel: item.ariaLabel || item["aria-label"],
        ariaCurrentValue: active ? "page" : undefined,
      });

      return (
        <a
          class={itemLinkClass}
          data-slot="link"
          href={linkAttrs.href}
          target={linkAttrs.target}
          rel={linkAttrs.rel}
          aria-label={item.ariaLabel || item["aria-label"]}
          aria-current={active ? "page" : undefined}
          aria-disabled={disabled ? "true" : undefined}
          tabindex={disabled ? -1 : undefined}
        >
          {content}
        </a>
      );
    }

    return (
      <span class={itemLinkClass} data-slot="link" aria-current={active ? "page" : undefined}>
        {content}
      </span>
    );
  };

  const rootClasses = createMemo(() =>
    breadcrumbTheme({
      color: resolvedColor(),
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <RootTag
      aria-label="Breadcrumb"
      class={cx(rootClasses().root, props.ui?.root, props.class)}
      data-slot="root"
      {...rest}
    >
      {props.items ? (
        <ol class={cx(rootClasses().list, props.ui?.list)} data-slot="list">
          <For each={visibleItemsWithMeta()}>
            {({ item, originalIndex, isLast, isOverflow, hiddenCount }) => {
              if (isOverflow) {
                return (
                  <li
                    class={cx(
                      "inline-flex items-center gap-1.5 list-none shrink-0",
                      props.ui?.item,
                    )}
                    aria-hidden="true"
                    data-slot="overflow"
                  >
                    <span class="text-muted tracking-wider font-medium select-none">…</span>
                    <span class="text-muted text-xs font-semibold select-none">+{hiddenCount}</span>
                    {renderSeparator()}
                  </li>
                );
              }

              return (
                <li class={cx(rootClasses().item, props.ui?.item, item?.ui?.item)} data-slot="item">
                  {renderItemContent(item, originalIndex, isLast)}
                  {!isLast && renderSeparator(item, originalIndex)}
                </li>
              );
            }}
          </For>
        </ol>
      ) : (
        <ol class={cx(rootClasses().list, props.ui?.list)} data-slot="list">
          {props.children}
        </ol>
      )}
    </RootTag>
  );
};

export { RLBreadcrumb };
