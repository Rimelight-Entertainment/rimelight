import { ref } from "vue"
import { actions } from "astro:actions"
import { useToast } from "../app/useToast"
import { useConfirm } from "../app/useConfirm"

export interface Asset {
  key: string
  size: number
  contentType?: string
  httpMetadata?: Record<string, any>
  customMetadata?: Record<string, any>
  [key: string]: any
}

const assets = ref<Asset[]>([])
const status = ref<"idle" | "pending" | "success" | "error">("idle")
const selectedPath = ref("")
const selectedKeys = ref<string[]>([])
const localFolders = ref<string[]>([])

function splitFilename(name: string) {
  const lastDotIndex = name.lastIndexOf(".")
  if (lastDotIndex === -1) {
    return { basename: name, extension: "" }
  }
  return {
    basename: name.substring(0, lastDotIndex),
    extension: name.substring(lastDotIndex)
  }
}

function getExt(key: string) {
  const fileName = key.split("/").pop() || ""
  return fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : ""
}

function downloadAsset(key: string) {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/")
  const link = document.createElement("a")
  link.href = `/api/assets/${encodedKey}`
  const fileName = key.split("/").pop() || key
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function useAssetManagement() {
  const { confirm } = useConfirm()
  const toast = useToast()
  const isProcessing = ref(false)

  async function refresh() {
    status.value = "pending"
    selectedKeys.value = []
    localFolders.value = []

    try {
      const { data, error } = await actions.assets.getAssets()
      if (error) {
        status.value = "error"
        console.error("Failed to load assets", error)
        return
      }
      assets.value = (data as Asset[]) || []
      status.value = "success"
    } catch (err) {
      status.value = "error"
      console.error(err)
    }
  }

  // Operations
  async function uploadAsset(file: File | File[], targetPath: string, customBasename?: string) {
    const files = Array.isArray(file) ? file : [file]
    isProcessing.value = true

    try {
      const uploadPromises = files.map(async (f) => {
        const body = await f.arrayBuffer()
        const { extension } = splitFilename(f.name)

        const finalBasename =
          files.length === 1 && customBasename
            ? customBasename
            : f.name.substring(0, f.name.lastIndexOf(".")) || f.name

        const filename = finalBasename + extension
        const fullKey = targetPath ? `${targetPath}/${filename}` : filename
        const encodedKey = fullKey.split("/").map(encodeURIComponent).join("/")

        const res = await fetch(`/api/assets/${encodedKey}`, {
          method: "PUT",
          body,
          headers: {
            "Content-Type": f.type
          }
        })
        if (!res.ok) throw new Error("Upload failed")
        return res.json()
      })

      await Promise.all(uploadPromises)

      toast.add({
        color: "success",
        title:
          files.length === 1
            ? "Asset uploaded successfully"
            : `${files.length} assets uploaded successfully`
      })
      await refresh()
      return { success: true }
    } catch (err) {
      toast.add({ color: "error", title: "Failed to upload asset(s)" })
      console.error("Upload failed", err)
      return { success: false, error: err }
    } finally {
      isProcessing.value = false
    }
  }

  async function deleteAsset(key: string) {
    const isConfirmed = await confirm({
      title: "Delete Asset",
      description: `Are you sure you want to delete ${key}? This action cannot be undone.`,
      confirmLabel: "Delete",
      danger: true
    })

    if (!isConfirmed) return false

    try {
      const encodedKey = key.split("/").map(encodeURIComponent).join("/")
      const res = await fetch(`/api/assets/${encodedKey}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Delete failed")

      toast.add({ color: "success", title: "Asset deleted successfully" })
      await refresh()
      return true
    } catch (err) {
      toast.add({ color: "error", title: "Failed to delete asset" })
      console.error("Delete failed", err)
      return false
    }
  }

  async function moveAsset(originalKey: string, targetFolder: string, newBasename: string) {
    const ext = getExt(originalKey)
    const cleanBasename =
      newBasename.endsWith(ext) && ext !== "" ? newBasename.slice(0, -ext.length) : newBasename

    const newFilename = cleanBasename + ext

    const normalizedFolder =
      targetFolder === "Root" || targetFolder === "/" ? "" : targetFolder.replace(/^\/|\/$/g, "")
    const newKey = normalizedFolder ? `${normalizedFolder}/${newFilename}` : newFilename

    if (originalKey === newKey) return true

    isProcessing.value = true
    try {
      const encodedOriginalKey = originalKey.split("/").map(encodeURIComponent).join("/")
      const res = await fetch(`/api/assets/${encodedOriginalKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: newKey })
      })
      if (!res.ok) throw new Error("Move failed")

      toast.add({ color: "success", title: "Asset moved/renamed successfully" })
      await refresh()
      return true
    } catch (err) {
      toast.add({ color: "error", title: "Failed to move/rename asset" })
      console.error("Move failed", err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  async function batchDelete() {
    const count = selectedKeys.value.length
    if (count === 0) return false

    const isConfirmed = await confirm({
      title: "Batch Delete",
      description: `Are you sure you want to delete ${count} selected assets? This action cannot be undone.`,
      confirmLabel: "Delete Selected",
      danger: true
    })

    if (!isConfirmed) return false

    isProcessing.value = true
    try {
      const deletePromises = selectedKeys.value.map((key) => {
        const encodedKey = key.split("/").map(encodeURIComponent).join("/")
        return fetch(`/api/assets/${encodedKey}`, { method: "DELETE" })
      })
      await Promise.all(deletePromises)
      toast.add({ color: "success", title: "Assets deleted successfully" })
      selectedKeys.value = []
      await refresh()
      return true
    } catch (err) {
      toast.add({ color: "error", title: "Failed to delete assets" })
      console.error("Batch delete failed", err)
      return false
    } finally {
      isProcessing.value = false
    }
  }

  function addLocalFolder(name: string, parentPath: string) {
    const cleanName = name.trim().replace(/\//g, "-")
    if (!cleanName) return null

    const newPath = parentPath ? `${parentPath}/${cleanName}` : cleanName
    if (!localFolders.value.includes(newPath)) {
      localFolders.value.push(newPath)
    }
    return newPath
  }

  return {
    assets,
    status,
    selectedPath,
    selectedKeys,
    localFolders,
    isProcessing,
    refresh,
    uploadAsset,
    deleteAsset,
    moveAsset,
    batchDelete,
    downloadAsset,
    addLocalFolder,
    splitFilename
  }
}
