import { ref, computed } from "vue"
import { defaultWindow } from "@/utils/ssr"

// Simple inline Time class compatible with @internationalized/date
export class Time {
  constructor(
    public hour: number,
    public minute: number,
    public second: number = 0
  ) {}
}

interface TimerPreset {
  label: string
  time: { hour: number; minute: number; second: number }
  theme: string
}

// Module-level shared states safe for Vue Islands
const initialTime = ref({
  hour: 0,
  minute: 25,
  second: 0
})
const timeLeft = ref(25 * 60)
const isRunning = ref(false)
const sessionsCompleted = ref(0)
const mode = ref<"work" | "short-break" | "long-break">("work")
const isModified = ref(false)
const error = ref<Error | null>(null)
const status = ref<"idle" | "running" | "paused" | "completed">("idle")

let activeTimerInterval: any = null

export const useFocusTimer = () => {
  const presets: Record<"work" | "short-break" | "long-break", TimerPreset> = {
    "work": { label: "Work", time: { hour: 0, minute: 25, second: 0 }, theme: "primary" },
    "short-break": {
      label: "Short Break",
      time: { hour: 0, minute: 5, second: 0 },
      theme: "success"
    },
    "long-break": { label: "Long Break", time: { hour: 0, minute: 15, second: 0 }, theme: "info" }
  }

  const initialTimeValue = computed({
    get: () => new Time(initialTime.value.hour, initialTime.value.minute, initialTime.value.second),
    set: (val) => {
      initialTime.value = { hour: val.hour, minute: val.minute, second: val.second }
      isModified.value = true
    }
  })

  const formattedTime = computed(() => {
    const h = Math.floor(timeLeft.value / 3600)
    const m = Math.floor((timeLeft.value % 3600) / 60)
    const s = timeLeft.value % 60

    if (h > 0) {
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  })

  const progress = computed(() => {
    const total =
      initialTime.value.minute * 60 + initialTime.value.second + initialTime.value.hour * 3600
    if (total === 0) return 0
    return ((total - timeLeft.value) / total) * 100
  })

  function setMode(newMode: "work" | "short-break" | "long-break") {
    mode.value = newMode
    initialTime.value = presets[newMode].time
    timeLeft.value =
      initialTime.value.hour * 3600 + initialTime.value.minute * 60 + initialTime.value.second
    isModified.value = false
  }

  function startTimer() {
    if (isRunning.value) return

    if (timeLeft.value <= 0 || isModified.value) {
      timeLeft.value =
        initialTime.value.hour * 3600 + initialTime.value.minute * 60 + initialTime.value.second
      isModified.value = false
    }

    if (
      defaultWindow &&
      "Notification" in defaultWindow &&
      (defaultWindow as any).Notification.permission === "default"
    ) {
      ;(defaultWindow as any).Notification.requestPermission()
    }

    isRunning.value = true
    status.value = "running"
    runInterval()
  }

  function runInterval() {
    if (activeTimerInterval) clearInterval(activeTimerInterval)
    activeTimerInterval = setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        completeSession()
      }
    }, 1000)
  }

  function pauseTimer() {
    isRunning.value = false
    status.value = "paused"
    if (activeTimerInterval) {
      clearInterval(activeTimerInterval)
      activeTimerInterval = null
    }
  }

  function resetTimer() {
    pauseTimer()
    status.value = "idle"
    timeLeft.value =
      initialTime.value.hour * 3600 + initialTime.value.minute * 60 + initialTime.value.second
    isModified.value = false
  }

  function completeSession() {
    pauseTimer()
    status.value = "completed"

    if (mode.value === "work") {
      sessionsCompleted.value++
    }

    if (defaultWindow) {
      const audio = new (defaultWindow as any).Audio(
        "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      )
      audio.play().catch(() => {})
    }

    if (
      defaultWindow &&
      "Notification" in defaultWindow &&
      (defaultWindow as any).Notification.permission === "granted"
    ) {
      new (defaultWindow as any).Notification("Focus Timer Done!", {
        body: mode.value === "work" ? "Time for a break!" : "Break over, back to work!",
        icon: "/logo.png"
      })
    }

    if (mode.value === "work") {
      if (sessionsCompleted.value % 4 === 0) {
        setMode("long-break")
      } else {
        setMode("short-break")
      }
    } else {
      setMode("work")
    }
  }

  // Client-side auto-restart if timer was running
  if (isRunning.value && !activeTimerInterval && typeof window !== "undefined") {
    runInterval()
  }

  return {
    initialTimeValue,
    timeLeft,
    isRunning,
    sessionsCompleted,
    mode,
    isModified,
    error,
    status,
    formattedTime,
    progress,
    presets,
    setMode,
    startTimer,
    pauseTimer,
    resetTimer
  }
}
