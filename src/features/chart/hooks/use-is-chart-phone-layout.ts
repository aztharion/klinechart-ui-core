import { useEffect, useState } from "react"

/** Matches Tailwind `md` breakpoint used across jtrader. */
export const CHART_PHONE_MAX_WIDTH = 767

export function isChartPhoneLayout(): boolean {
  if (typeof window === "undefined") return false
  return window.innerWidth <= CHART_PHONE_MAX_WIDTH
}

export function useIsChartPhoneLayout(): boolean {
  const [isPhone, setIsPhone] = useState(isChartPhoneLayout)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${CHART_PHONE_MAX_WIDTH}px)`)
    const sync = () => setIsPhone(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  return isPhone
}
