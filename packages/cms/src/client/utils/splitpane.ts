export function initSplitPane(
  container: HTMLElement,
  leftPane: HTMLElement,
  rightPane: HTMLElement,
  handle: HTMLElement
) {
  let isDragging = false

  handle.addEventListener("mousedown", (e) => {
    isDragging = true
    handle.classList.add("active")
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
    e.preventDefault()
  })

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return
    const containerRect = container.getBoundingClientRect()
    const offset = e.clientX - containerRect.left
    const percentage = (offset / containerRect.width) * 100

    if (percentage > 20 && percentage < 80) {
      leftPane.style.flex = `0 0 ${percentage}%`
      rightPane.style.flex = `0 0 ${100 - percentage}%`
    }
  })

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false
      handle.classList.remove("active")
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  })
}
