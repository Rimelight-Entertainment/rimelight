import type { RLDashboardSearchProps } from "./dashboard-search.types";
import { RLDashboardSearchTheme } from "./dashboard-search.theme";
import { onSettled, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { uiT } from "../../locale";
import { createControllable } from "../../controllable";

const OMIT_KEYS = ["open", "defaultOpen", "onOpenChange"] as const;

export const RLDashboardSearch: Component<RLDashboardSearchProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLDashboardSearchTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const [isOpen, setOpen] = createControllable(
    () => props.open,
    props.defaultOpen ?? false,
    props.onOpenChange,
  );
  let inputRef: HTMLInputElement | null = null;

  const setOpenState = (open: boolean) => {
    setOpen(open);
    if (open) {
      setTimeout(() => inputRef?.focus(), 50);
    }
  };

  onSettled(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenState(!isOpen());
      } else if (e.key === "Escape" && isOpen()) {
        setOpenState(false);
      }
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      const btn = target?.closest("[data-dashboard-search-button]");
      if (btn) {
        setOpenState(!isOpen());
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onClick);
    };
  });

  return (
    <Tag
      data-dashboard-search-target
      data-slot="root"
      data-theme={theme()}
      class={classes().root}
      {...rest}
    >
      {children()}

      <Show when={isOpen()}>
        <div
          data-dashboard-search
          data-slot="modal"
          class={classes().modal}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenState(false);
          }}
        >
          <div
            data-slot="backdrop"
            class={classes().backdrop}
            onClick={() => setOpenState(false)}
          />
          <div data-slot="dialog" class={classes().dialog}>
            <div data-slot="header" class={classes().header}>
              <RLIcon name="search" class={classes().icon} />
              <input
                ref={(el) => (inputRef = el)}
                type="text"
                data-dashboard-search-input
                data-slot="input"
                placeholder={uiT("search.placeholder")}
                class={classes().input}
              />
              <RLButton
                type="button"
                variant="ghost"
                color="neutral"
                data-slot="close"
                aria-label={uiT("search.close")}
                class={classes().close}
                onClick={() => setOpenState(false)}
              >
                <RLIcon name="x" class={classes().closeIcon} />
              </RLButton>
            </div>
            <div data-slot="body" class={classes().body}>
              {uiT("search.type-to-search")}
            </div>
          </div>
        </div>
      </Show>
    </Tag>
  );
};
