import readline from "node:readline"
import readlinePromises from "node:readline/promises"
import { styleText } from "node:util"

// --- Terminal Styling (Node 22+ styleText with graceful fallback) ---

export const pc = {
  magenta: (text) => styleTextSafe("magenta", text),
  bold: (text) => styleTextSafe("bold", text),
  green: (text) => styleTextSafe("green", text),
  cyan: (text) => styleTextSafe("cyan", text),
  yellow: (text) => styleTextSafe("yellow", text),
  red: (text) => styleTextSafe("red", text),
  dim: (text) => styleTextSafe("dim", text)
}

function styleTextSafe(format, text) {
  if (typeof styleText === "function") {
    try {
      return styleText(format, String(text))
    } catch {
      // fallback to raw ANSI if format is unsupported
    }
  }
  const codes = {
    bold: ["\x1b[1m", "\x1b[22m"],
    dim: ["\x1b[2m", "\x1b[22m"],
    red: ["\x1b[31m", "\x1b[39m"],
    green: ["\x1b[32m", "\x1b[39m"],
    yellow: ["\x1b[33m", "\x1b[39m"],
    magenta: ["\x1b[35m", "\x1b[39m"],
    cyan: ["\x1b[36m", "\x1b[39m"]
  }
  const [open, close] = codes[format] || ["", ""]
  return `${open}${text}${close}`
}

// --- Cancellation Symbol ---

const CANCEL_SYMBOL = Symbol("rimelight:cancel")

export function isCancel(value) {
  return value === CANCEL_SYMBOL
}

export function intro(title) {
  console.log(`\n${title}\n`)
}

export function outro(message) {
  console.log(`\n${message}\n`)
}

export function cancel(message) {
  console.log(`\n${pc.red(message)}\n`)
}

// --- Interactive Prompts ---

export async function text(options) {
  const { message, placeholder, validate, defaultValue = "" } = options
  const isTTY = process.stdin.isTTY && process.stdout.isTTY

  if (!isTTY) {
    return defaultValue
  }

  const promptMsg = placeholder ? `${message} ${pc.dim(`(${placeholder})`)}: ` : `${message}: `

  while (true) {
    const rl = readlinePromises.createInterface({
      input: process.stdin,
      output: process.stdout
    })

    try {
      const answer = await rl.question(promptMsg)
      rl.close()

      const val = answer.trim() || defaultValue
      if (validate) {
        const error = validate(val)
        if (error) {
          console.log(pc.yellow(`⚠ ${error}`))
          continue
        }
      }
      return val
    } catch {
      rl.close()
      return CANCEL_SYMBOL
    }
  }
}

export async function confirm(options) {
  const { message, initialValue = true } = options
  const isTTY = process.stdin.isTTY && process.stdout.isTTY

  if (!isTTY) {
    return initialValue
  }

  const hint = initialValue ? "[Y/n]" : "[y/N]"
  const promptMsg = `${message} ${pc.dim(hint)}: `

  const rl = readlinePromises.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  try {
    const answer = await rl.question(promptMsg)
    rl.close()

    const trimmed = answer.trim().toLowerCase()
    if (!trimmed) return initialValue
    return trimmed === "y" || trimmed === "yes"
  } catch {
    rl.close()
    return CANCEL_SYMBOL
  }
}

export async function select(options) {
  const { message, options: choices, initialValue } = options
  const isTTY = process.stdin.isTTY && process.stdout.isTTY

  if (!isTTY || choices.length === 0) {
    return initialValue ?? choices[0]?.value
  }

  let selectedIndex = Math.max(
    0,
    choices.findIndex((c) => c.value === initialValue)
  )

  return new Promise((resolve) => {
    const { stdin, stdout } = process

    const render = (first = false) => {
      if (!first) {
        // Move cursor up by (choices.length + 1) lines
        stdout.write(`\x1b[${choices.length + 1}A\r\x1b[J`)
      }
      stdout.write(`${pc.magenta("?")} ${pc.bold(message)}\n`)
      choices.forEach((choice, idx) => {
        const isSelected = idx === selectedIndex
        const pointer = isSelected ? pc.cyan("❯") : " "
        const label = isSelected ? pc.cyan(choice.label) : choice.label
        const hint = choice.hint ? ` ${pc.dim(`(${choice.hint})`)}` : ""
        stdout.write(`  ${pointer} ${label}${hint}\n`)
      })
    }

    const cleanup = () => {
      stdin.removeListener("keypress", onKeyPress)
      if (stdin.isTTY) stdin.setRawMode(false)
      stdout.write("\x1b[?25h") // show cursor
    }

    const onKeyPress = (_, key) => {
      if (key) {
        if (key.name === "c" && key.ctrl) {
          cleanup()
          resolve(CANCEL_SYMBOL)
          return
        }
        if (key.name === "up" || key.name === "k") {
          selectedIndex = (selectedIndex - 1 + choices.length) % choices.length
          render()
          return
        }
        if (key.name === "down" || key.name === "j") {
          selectedIndex = (selectedIndex + 1) % choices.length
          render()
          return
        }
        if (key.name === "return" || key.name === "enter") {
          cleanup()
          resolve(choices[selectedIndex]?.value)
          return
        }
        if (key.name === "escape") {
          cleanup()
          resolve(CANCEL_SYMBOL)
          return
        }
      }
    }

    readline.emitKeypressEvents(stdin)
    if (stdin.isTTY) stdin.setRawMode(true)
    stdout.write("\x1b[?25l") // hide cursor
    render(true)
    stdin.on("keypress", onKeyPress)
  })
}

export async function multiselect(options) {
  const { message, options: choices, initialValues = [], required = false } = options
  const isTTY = process.stdin.isTTY && process.stdout.isTTY

  if (!isTTY || choices.length === 0) {
    return initialValues.length > 0 ? initialValues : choices.map((c) => c.value)
  }

  let selectedIndex = 0
  const selectedSet = new Set(initialValues)

  return new Promise((resolve) => {
    const { stdin, stdout } = process

    const render = (first = false) => {
      if (!first) {
        // Move cursor up by (choices.length + 2) lines
        stdout.write(`\x1b[${choices.length + 2}A\r\x1b[J`)
      }
      stdout.write(
        `${pc.magenta("?")} ${pc.bold(message)} ${pc.dim("(Space to toggle, Enter to submit)")}\n`
      )
      choices.forEach((choice, idx) => {
        const isCurrent = idx === selectedIndex
        const isChecked = selectedSet.has(choice.value)
        const pointer = isCurrent ? pc.cyan("❯") : " "
        const checkbox = isChecked ? pc.green("[✔]") : pc.dim("[ ]")
        const label = isCurrent ? pc.cyan(choice.label) : choice.label
        const hint = choice.hint ? ` ${pc.dim(`(${choice.hint})`)}` : ""
        stdout.write(`  ${pointer} ${checkbox} ${label}${hint}\n`)
      })
      stdout.write(`  ${pc.dim(`${selectedSet.size} selected`)}\n`)
    }

    const cleanup = () => {
      stdin.removeListener("keypress", onKeyPress)
      if (stdin.isTTY) stdin.setRawMode(false)
      stdout.write("\x1b[?25h") // show cursor
    }

    const onKeyPress = (_, key) => {
      if (key) {
        if (key.name === "c" && key.ctrl) {
          cleanup()
          resolve(CANCEL_SYMBOL)
          return
        }
        if (key.name === "up" || key.name === "k") {
          selectedIndex = (selectedIndex - 1 + choices.length) % choices.length
          render()
          return
        }
        if (key.name === "down" || key.name === "j") {
          selectedIndex = (selectedIndex + 1) % choices.length
          render()
          return
        }
        if (key.name === "space") {
          const val = choices[selectedIndex]?.value
          if (selectedSet.has(val)) {
            selectedSet.delete(val)
          } else {
            selectedSet.add(val)
          }
          render()
          return
        }
        if (key.name === "return" || key.name === "enter") {
          if (required && selectedSet.size === 0) {
            render()
            return
          }
          cleanup()
          resolve(Array.from(selectedSet))
          return
        }
        if (key.name === "escape") {
          cleanup()
          resolve(CANCEL_SYMBOL)
          return
        }
      }
    }

    readline.emitKeypressEvents(stdin)
    if (stdin.isTTY) stdin.setRawMode(true)
    stdout.write("\x1b[?25l") // hide cursor
    render(true)
    stdin.on("keypress", onKeyPress)
  })
}

// --- Terminal Spinner ---

export function spinner() {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]
  let frameIndex = 0
  let intervalId = null
  let currentMessage = ""
  const isTTY = process.stdout.isTTY

  return {
    start(msg = "") {
      currentMessage = msg
      if (isTTY) {
        process.stdout.write("\x1b[?25l") // hide cursor
        intervalId = setInterval(() => {
          const frame = pc.cyan(frames[frameIndex] || "⠋")
          frameIndex = (frameIndex + 1) % frames.length
          process.stdout.write(`\r${frame} ${currentMessage}`)
        }, 80)
      } else {
        console.log(`ℹ ${msg}`)
      }
    },
    message(msg = "") {
      currentMessage = msg
    },
    stop(finalMessage = "") {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
      if (isTTY) {
        process.stdout.write(`\r\x1b[K`) // clear line
        process.stdout.write("\x1b[?25h") // show cursor
      }
      if (finalMessage) {
        console.log(finalMessage)
      }
    }
  }
}
