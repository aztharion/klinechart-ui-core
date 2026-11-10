import { useCallback, useState } from "react"

const PREFIX = "klinechart:chart:"
const LEGACY_PREFIX = "jtrader:chart:"

export function loadPersisted<T>(key: string, fallback: T): T {
  try {
    // Check direct key first (e.g. "theme" for easy standard access)
    if (key === "theme") {
      const direct = localStorage.getItem("theme")
      if (direct != null) {
        return (direct.startsWith('"') ? JSON.parse(direct) : direct) as T
      }
    }
    const raw =
      localStorage.getItem(PREFIX + key) ??
      localStorage.getItem(LEGACY_PREFIX + key)
    return raw == null ? fallback : (JSON.parse(raw) as T)
  } catch {
    return fallback
  }
}

export function savePersisted<T>(key: string, value: T): void {
  try {
    if (key === "theme") {
      localStorage.setItem("theme", typeof value === "string" ? value : JSON.stringify(value))
    }
    const serialized = JSON.stringify(value)
    localStorage.setItem(PREFIX + key, serialized)
    localStorage.setItem(LEGACY_PREFIX + key, serialized)
  } catch {
    /* storage unavailable / quota */
  }
}

/** `useState` mirrored to localStorage with fallback support. */
export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadPersisted(key, fallback))

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === "function" ? (next as (p: T) => T)(prev) : next
        savePersisted(key, resolved)
        return resolved
      })
    },
    [key]
  )

  return [value, set] as const
}
