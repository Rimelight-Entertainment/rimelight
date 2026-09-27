import { createEffect, createMemo, createSignal, Show, omit, type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import type { ColorSliderProps } from "./color-slider"
import { colorSliderTheme } from "./color-slider.theme"
import {
  clamp,
  getChannelRange,
  hexToRgb,
  hslToRgb,
  hsbToRgb,
  rgbToHex,
  rgbToHsb,
  rgbToHsl
} from "../color-picker/color"

export interface RLColorSliderProps extends ColorSliderProps {
  "children"?: JSX.Element
  "value"?: string
  "onChange"?: (val: string) => void
  "onChangeEnd"?: (val: string) => void
  "onUpdate:modelValue"?: (val: string) => void
}

const RLColorSlider: Component<RLColorSliderProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "channel",
    "colorSpace",
    "defaultValue",
    "dir",
    "disabled",
    "inverted",
    "modelValue",
    "value",
    "name",
    "orientation",
    "required",
    "step",
    "color",
    "theme",
    "ui",
    "class",
    "children",
    "onChange",
    "onChangeEnd",
    "onUpdate:modelValue"
  )

  const channel = () => props.channel || "hue"
  const colorSpace = () => props.colorSpace ?? "hsl"
  const orientation = () => props.orientation ?? "horizontal"
  const stepValue = () => props.step ?? 1
  const initialHex = () => props.modelValue ?? props.value ?? props.defaultValue ?? "#000000"

  const [currentHex, setCurrentHex] = createSignal(initialHex())

  createEffect(
    () => props.modelValue ?? props.value,
    (controlled) => {
      if (controlled !== undefined) {
        setCurrentHex(controlled)
      }
    }
  )

  const updateColor = (newHex: string, isFinal = false) => {
    if (props.modelValue === undefined && props.value === undefined) {
      setCurrentHex(newHex)
    }
    props.onChange?.(newHex)
    props["onUpdate:modelValue"]?.(newHex)
    if (isFinal) {
      props.onChangeEnd?.(newHex)
    }
  }

  let trackRef: HTMLDivElement | null = null

  const channelValue = () => {
    const hex = currentHex()
    const rgb = hexToRgb(hex)
    const ch = channel()
    const cs = colorSpace()

    if (cs === "hsl") {
      const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
      const index = ["hue", "saturation", "lightness"].indexOf(ch)
      return index !== -1 ? hsl[index]! : 0
    } else if (cs === "hsb") {
      const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2])
      const index = ["hue", "saturation", "brightness"].indexOf(ch)
      return index !== -1 ? hsb[index]! : 0
    } else if (cs === "rgb") {
      const index = ["red", "green", "blue"].indexOf(ch)
      return index !== -1 ? rgb[index]! : 0
    }
    return 0
  }

  const thumbPercent = createMemo(() => {
    const range = getChannelRange(channel())
    let pct = ((channelValue() - range.min) / (range.max - range.min)) * 100
    if (props.inverted) {
      pct = 100 - pct
    }
    return clamp(pct, 0, 100)
  })

  const trackGradient = createMemo(() => {
    const isHoriz = orientation() === "horizontal"
    const dir = isHoriz ? "to right" : "to top"
    const ch = channel()
    const cs = colorSpace()

    if (ch === "hue") {
      return `linear-gradient(${dir}, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)`
    }

    const rgb = hexToRgb(currentHex())
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
    const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2])
    const range = getChannelRange(ch)

    let startHex = "#000000"
    let endHex = "#ffffff"

    if (cs === "hsl") {
      const index = ["hue", "saturation", "lightness"].indexOf(ch)
      if (index !== -1) {
        const startHsl = [...hsl] as [number, number, number]
        const endHsl = [...hsl] as [number, number, number]
        startHsl[index] = range.min
        endHsl[index] = range.max
        const startRgb = hslToRgb(startHsl[0], startHsl[1], startHsl[2])
        const endRgb = hslToRgb(endHsl[0], endHsl[1], endHsl[2])
        startHex = rgbToHex(startRgb[0], startRgb[1], startRgb[2])
        endHex = rgbToHex(endRgb[0], endRgb[1], endRgb[2])
      }
    } else if (cs === "hsb") {
      const index = ["hue", "saturation", "brightness"].indexOf(ch)
      if (index !== -1) {
        const startHsb = [...hsb] as [number, number, number]
        const endHsb = [...hsb] as [number, number, number]
        startHsb[index] = range.min
        endHsb[index] = range.max
        const startRgb = hsbToRgb(startHsb[0], startHsb[1], startHsb[2])
        const endRgb = hsbToRgb(endHsb[0], endHsb[1], endHsb[2])
        startHex = rgbToHex(startRgb[0], startRgb[1], startRgb[2])
        endHex = rgbToHex(endRgb[0], endRgb[1], endRgb[2])
      }
    } else if (cs === "rgb") {
      const index = ["red", "green", "blue"].indexOf(ch)
      if (index !== -1) {
        const startRgb = [...rgb] as [number, number, number]
        const endRgb = [...rgb] as [number, number, number]
        startRgb[index] = range.min
        endRgb[index] = range.max
        startHex = rgbToHex(startRgb[0], startRgb[1], startRgb[2])
        endHex = rgbToHex(endRgb[0], endRgb[1], endRgb[2])
      }
    }

    return `linear-gradient(${dir}, ${startHex}, ${endHex})`
  })

  const updateFromPointer = (clientX: number, clientY: number, isFinal = false) => {
    const track = trackRef
    if (!track || props.disabled) return
    const rect = track.getBoundingClientRect()
    let pct = 0

    if (orientation() === "horizontal") {
      pct = clamp((clientX - rect.left) / rect.width, 0, 1)
    } else {
      pct = 1 - clamp((clientY - rect.top) / rect.height, 0, 1)
    }

    if (props.inverted) {
      pct = 1 - pct
    }

    const range = getChannelRange(channel())
    const step = stepValue()
    let targetVal = range.min + pct * (range.max - range.min)
    targetVal = Math.round(targetVal / step) * step
    targetVal = clamp(targetVal, range.min, range.max)

    const rgb = hexToRgb(currentHex())
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
    const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2])
    let newRgb = [...rgb] as [number, number, number]
    const ch = channel()
    const cs = colorSpace()

    if (cs === "hsl") {
      const index = ["hue", "saturation", "lightness"].indexOf(ch)
      if (index !== -1) hsl[index] = targetVal
      newRgb = hslToRgb(hsl[0], hsl[1], hsl[2])
    } else if (cs === "hsb") {
      const index = ["hue", "saturation", "brightness"].indexOf(ch)
      if (index !== -1) hsb[index] = targetVal
      newRgb = hsbToRgb(hsb[0], hsb[1], hsb[2])
    } else if (cs === "rgb") {
      const index = ["red", "green", "blue"].indexOf(ch)
      if (index !== -1) newRgb[index] = targetVal
    }

    const newHex = rgbToHex(newRgb[0], newRgb[1], newRgb[2])
    updateColor(newHex, isFinal)
  }

  let isDragging = false

  const handlePointerDown = (e: PointerEvent) => {
    if (props.disabled) return
    isDragging = true
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    updateFromPointer(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging || props.disabled) return
    updateFromPointer(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging) return
    isDragging = false
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {
      // ignore
    }
    updateFromPointer(e.clientX, e.clientY, true)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled) return
    const stepMultiplier = e.shiftKey ? 10 : 1
    const stepSize = stepValue() * stepMultiplier
    const range = getChannelRange(channel())
    const currentVal = channelValue()

    let handled = false
    let newVal = currentVal

    if (orientation() === "horizontal") {
      if (e.key === "ArrowLeft") {
        newVal = currentVal - stepSize
        handled = true
      } else if (e.key === "ArrowRight") {
        newVal = currentVal + stepSize
        handled = true
      }
    } else {
      if (e.key === "ArrowDown") {
        newVal = currentVal - stepSize
        handled = true
      } else if (e.key === "ArrowUp") {
        newVal = currentVal + stepSize
        handled = true
      }
    }

    if (e.key === "Home") {
      newVal = range.min
      handled = true
    } else if (e.key === "End") {
      newVal = range.max
      handled = true
    } else if (e.key === "PageUp") {
      newVal = currentVal + stepSize * 10
      handled = true
    } else if (e.key === "PageDown") {
      newVal = currentVal - stepSize * 10
      handled = true
    }

    if (handled) {
      e.preventDefault()
      newVal = clamp(newVal, range.min, range.max)

      const rgb = hexToRgb(currentHex())
      const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2])
      const hsb = rgbToHsb(rgb[0], rgb[1], rgb[2])
      let newRgb = [...rgb] as [number, number, number]
      const ch = channel()
      const cs = colorSpace()

      if (cs === "hsl") {
        const index = ["hue", "saturation", "lightness"].indexOf(ch)
        if (index !== -1) hsl[index] = newVal
        newRgb = hslToRgb(hsl[0], hsl[1], hsl[2])
      } else if (cs === "hsb") {
        const index = ["hue", "saturation", "brightness"].indexOf(ch)
        if (index !== -1) hsb[index] = newVal
        newRgb = hsbToRgb(hsb[0], hsb[1], hsb[2])
      } else if (cs === "rgb") {
        const index = ["red", "green", "blue"].indexOf(ch)
        if (index !== -1) newRgb[index] = newVal
      }

      const newHex = rgbToHex(newRgb[0], newRgb[1], newRgb[2])
      updateColor(newHex, true)
    }
  }

  const resolvedClasses = createMemo(() =>
    colorSliderTheme({
      color: props.color,
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div
      class={`${resolvedClasses().root} ${props.disabled ? "opacity-50 pointer-events-none" : ""}`}
      data-slot="root"
      data-theme={props.theme}
      data-orientation={orientation()}
      data-channel={channel()}
      data-color-space={colorSpace()}
      data-value={currentHex()}
      data-disabled={props.disabled ? "true" : "false"}
      data-inverted={props.inverted ? "true" : "false"}
      {...rest}
    >
      <div
        ref={(el) => (trackRef = el)}
        class={resolvedClasses().track}
        data-slot="track"
        style={{ background: trackGradient() }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          class={resolvedClasses().thumb}
          data-slot="thumb"
          role="slider"
          aria-label="Color Slider Thumb"
          tabindex={props.disabled ? -1 : 0}
          onKeyDown={handleKeyDown}
          style={
            orientation() === "horizontal"
              ? {
                  "left": `${thumbPercent()}%`,
                  "top": "50%",
                  "transform": "translate(-50%, -50%)",
                  "background-color": currentHex()
                }
              : {
                  "left": "50%",
                  "top": `${100 - thumbPercent()}%`,
                  "transform": "translate(-50%, -50%)",
                  "background-color": currentHex()
                }
          }
        />
      </div>
      <Show when={props.name}>
        <input type="hidden" name={props.name} value={currentHex()} data-main-input />
      </Show>
    </div>
  )
}

export { RLColorSlider }
