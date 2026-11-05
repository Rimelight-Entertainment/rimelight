import { createMemo, For, Show } from "solid-js";
import type {
  BreadcrumbItem,
  BreadcrumbItemSlotContext,
  BreadcrumbItemState,
  BreadcrumbOverflowEntry,
  BreadcrumbUi,
  BreadcrumbVisibleEntry,
  BreadcrumbVisibleItem,
  RLBreadcrumbProps,
} from "./breadcrumb.types";
import { RLBreadcrumbTheme } from "./breadcrumb.theme";
import type { RLAvatarProps } from "../avatar/avatar.types";
import { RLIcon } from "../icon/RLIcon";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLButton } from "../button/RLButton";
import { RLLink } from "../link/RLLink";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";

const OMIT_KEYS = ["items", "separatorIcon", "labelKey", "maxVisible", "itemAttrs"] as const;

const avatarProps = (avatar: RLAvatarProps | string): RLAvatarProps =>
  typeof avatar === "string" ? { src: avatar } : avatar;

export const RLBreadcrumb = <T extends BreadcrumbItem = BreadcrumbItem>(
  props: RLBreadcrumbProps<T>,
) => {
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

  const max = () => props.maxVisible ?? 0;

  const getItemLabel = (item: T): string => {
    const val = (item as Record<string, unknown>)[props.labelKey ?? "label"] ?? item.label;
    return typeof val === "string" || typeof val === "number" ? String(val) : "";
  };

  const visibleEntries = createMemo<BreadcrumbVisibleEntry<T>[]>(() => {
    const items = props.items ?? [];
    const total = items.length;
    if (total === 0) return [];

    const itemEntry = (item: T, index: number): BreadcrumbVisibleItem<T> => ({
      kind: "item",
      item,
      originalIndex: index,
      isLast: index === total - 1,
    });

    if (!(max() > 0 && total > max() && total > 2)) {
      return items.map((item, index) => itemEntry(item, index));
    }

    const insideCount = max() - 2;
    const trailingStartIndex = total - 1 - insideCount;
    const overflow: BreadcrumbOverflowEntry = {
      kind: "overflow",
      hiddenCount: total - 1 - insideCount - 1,
    };

    const trailing: BreadcrumbVisibleEntry<T>[] = items
      .slice(trailingStartIndex, total - 1)
      .map((item, offset) => itemEntry(item, trailingStartIndex + offset));

    return [
      ...items.slice(0, 1).map((item) => itemEntry(item, 0)),
      overflow,
      ...trailing,
      ...items.slice(total - 1).map((item) => itemEntry(item, total - 1)),
    ];
  });

  const asItem = (entry: BreadcrumbVisibleEntry<T>) => (entry.kind === "item" ? entry : undefined);
  const asOverflow = (entry: BreadcrumbVisibleEntry<T>) =>
    entry.kind === "overflow" ? entry : undefined;

  // Per-item slot overrides: the item's own `ui` and `class` extend the component `ui`.
  const itemUi = (item: T): BreadcrumbUi | undefined => {
    const base = ui();
    if (!item.ui && !item.class) return base;
    return {
      ...base,
      ...item.ui,
      ...(item.class ? { link: [base?.link, item.ui?.link, item.class] } : {}),
    };
  };

  const itemState = (item: T, isLast: boolean): BreadcrumbItemState => {
    const hasTo = Boolean(item.href);
    const active = item.active !== undefined ? Boolean(item.active) : isLast;
    const disabled = Boolean(item.disabled);

    return {
      active,
      disabled,
      hasTo,
      itemClasses: createMemo(() =>
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

  const renderSeparator = (item?: T, index?: number) => {
    const separatorClasses = createMemo(() =>
      RLBreadcrumbTheme({
        color: props.color,
        ui: item?.ui ? { ...ui(), ...item.ui } : ui(),
      }),
    );

    return (
      <span class={separatorClasses().separator} data-slot="separator" aria-hidden="true">
        <Show
          when={slots.separatorSlot()}
          fallback={
            <span class={separatorClasses().separatorIcon} data-slot="separator-icon">
              <RLIcon name={props.separatorIcon ?? "chevron-right"} aria-hidden="true" />
            </span>
          }
        >
          {(separator) => renderSlot(separator(), { item, index })}
        </Show>
      </span>
    );
  };

  const renderItemContent = (item: T, index: number, state: BreadcrumbItemState) => {
    const itemClasses = state.itemClasses;
    const ctx: BreadcrumbItemSlotContext<T> = { item, index, active: state.active };

    const renderDefaultLeading = () => (
      <Show
        when={item.avatar}
        fallback={
          <Show when={item.icon}>
            {(icon) => (
              <span class={itemClasses().linkLeadingIcon} data-slot="link-leading-icon">
                <RLIcon name={icon()} aria-hidden="true" />
              </span>
            )}
          </Show>
        }
      >
        {(avatar) => (
          <span class={itemClasses().linkLeadingAvatar} data-slot="link-leading-avatar">
            <RLAvatar size="xs" {...avatarProps(avatar())} />
          </span>
        )}
      </Show>
    );

    const renderLeading = () => (
      <Show when={slots.itemLeadingSlot()} fallback={renderDefaultLeading()}>
        {(node) => (
          <span class={itemClasses().itemLeading} data-slot="item-leading">
            {renderSlot(node(), ctx)}
          </span>
        )}
      </Show>
    );

    const renderLabel = () => (
      <Show
        when={slots.itemLabelSlot()}
        fallback={
          <span class={itemClasses().itemLabel} data-slot="item-label">
            {getItemLabel(item)}
          </span>
        }
      >
        {(node) => (
          <span class={itemClasses().itemLabel} data-slot="item-label">
            {renderSlot(node(), ctx)}
          </span>
        )}
      </Show>
    );

    const renderTrailing = () => (
      <Show when={slots.itemTrailingSlot()}>
        {(node) => (
          <span class={itemClasses().itemTrailing} data-slot="item-trailing">
            {renderSlot(node(), ctx)}
          </span>
        )}
      </Show>
    );

    const content = () => (
      <>
        {renderLeading()}
        {renderLabel()}
        {renderTrailing()}
      </>
    );

    return (
      <Show
        when={slots.itemSlot()}
        fallback={
          <Show
            when={state.hasTo}
            fallback={
              <Show
                when={item.onSelect}
                fallback={
                  <span
                    class={itemClasses().link}
                    data-slot="link"
                    aria-current={state.active ? "page" : undefined}
                  >
                    {content()}
                  </span>
                }
              >
                <RLButton
                  variant="ghost"
                  color="neutral"
                  size="sm"
                  class={itemClasses().link}
                  data-slot="link"
                  disabled={state.disabled}
                  aria-current={state.active ? "page" : undefined}
                  onClick={() => item.onSelect?.(item)}
                >
                  {content()}
                </RLButton>
              </Show>
            }
          >
            <RLLink
              class={itemClasses().link}
              data-slot="link"
              href={item.href}
              target={item.target}
              rel={item.rel}
              external={item.external}
              active={state.active}
              disabled={state.disabled}
              noExternalIcon
              localize={false}
              aria-label={item["aria-label"]}
            >
              {content()}
            </RLLink>
          </Show>
        }
      >
        {(node) => renderSlot(node(), ctx)}
      </Show>
    );
  };

  const overflowClasses = createMemo(() => {
    const u = ui();
    return RLBreadcrumbTheme({
      color: props.color,
      ui: u?.overflow === undefined && u?.item !== undefined ? { ...u, overflow: u.item } : u,
    });
  });

  const renderOverflow = (hiddenCount: number) => (
    <li class={overflowClasses().overflow} aria-hidden="true" data-slot="overflow">
      <span class={overflowClasses().overflowEllipsis} data-slot="overflow-ellipsis">
        …
      </span>
      <span class={overflowClasses().overflowCount} data-slot="overflow-count">
        +{hiddenCount}
      </span>
      {renderSeparator()}
    </li>
  );

  const renderItem = (entry: BreadcrumbVisibleItem<T>) => {
    const state = itemState(entry.item, entry.isLast);
    return (
      <li
        class={state.itemClasses().item}
        data-slot="item"
        {...(props.itemAttrs?.(entry.item, entry.originalIndex) ?? {})}
      >
        {renderItemContent(entry.item, entry.originalIndex, state)}
        <Show when={!entry.isLast}>{renderSeparator(entry.item, entry.originalIndex)}</Show>
      </li>
    );
  };

  return (
    <Tag
      aria-label={uiT("breadcrumb.label")}
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      {...rest}
    >
      <ol class={classes().list} data-slot="list">
        <Show when={props.items} fallback={children()}>
          <For each={visibleEntries()}>
            {(entry) => (
              <>
                <Show when={asItem(entry)}>{(item) => renderItem(item())}</Show>
                <Show when={asOverflow(entry)}>
                  {(overflow) => renderOverflow(overflow().hiddenCount)}
                </Show>
              </>
            )}
          </For>
        </Show>
      </ol>
    </Tag>
  );
};
