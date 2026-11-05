import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLStepperTheme } from "./stepper.theme";

export interface StepperItem {
  /**
   * Title rendered under the indicator.
   */
  title?: string | undefined;
  /**
   * Description rendered under the title.
   */
  description?: string | undefined;
  /**
   * Panel content rendered for this step.
   */
  content?: string | undefined;
  /**
   * Icon name rendered inside the indicator when no `indicatorSlot` is set.
   */
  icon?: string | undefined;
  /**
   * Value that identifies the step. Defaults to the item's index.
   */
  value?: string | number | undefined;
  /**
   * Disables this step.
   * @default false
   */
  disabled?: boolean | undefined;
}

export type StepperState = "completed" | "active" | "inactive";

export interface StepperItemContext {
  /**
   * The step being rendered.
   */
  item: StepperItem;
  /**
   * Zero-based position of the step.
   */
  index: number;
}

export interface StepperSlotContext extends StepperItemContext {
  /**
   * Progress of the step relative to the active one.
   */
  state: StepperState;
}

export type RLStepperProps = InferThemeProps<typeof RLStepperTheme> & {
  /**
   * The steps to render.
   */
  items?: StepperItem[] | undefined;
  /**
   * Active step value. Setting it makes the component controlled. Pair with `onValueChange`.
   */
  value?: string | number | undefined;
  /**
   * Initially active step value when uncontrolled. Defaults to the first step.
   */
  defaultValue?: string | number | undefined;
  /**
   * Called with the value of the step the user activates.
   */
  onValueChange?: ((value: string | number) => void) | undefined;
  /**
   * When `true`, steps beyond the next one cannot be activated.
   * @default true
   */
  linear?: boolean | undefined;
  /**
   * Disables every step.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Called when the user moves forward to a step.
   */
  onNext?: ((ctx: { index: number; value: string | number }) => void) | undefined;
  /**
   * Called when the user moves back to a step.
   */
  onPrev?: ((ctx: { index: number; value: string | number }) => void) | undefined;
  /**
   * Custom indicator content per step. Replaces the icon or number.
   */
  indicatorSlot?: SlotRenderer<StepperSlotContext> | undefined;
  /**
   * Custom wrapper content per step. Replaces the title and description.
   */
  wrapperSlot?: SlotRenderer<StepperItemContext> | undefined;
};
