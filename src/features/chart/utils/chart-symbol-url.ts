import type { PartialSymbolInfo } from "@/features/chart/datafeed/types"
import { defaultSymbol } from "@/features/chart/datafeed"

/** Parse `?symbol=BINANCE%3ABTCUSDT` → `{ source: "BINANCE", ticker: "BTCUSDT" }`. */
export function parseChartSymbolParam(param: string): {
  source: string
  ticker: string
} | null {
  const decoded = decodeURIComponent(param).trim()
  if (!decoded) return null

  const colon = decoded.indexOf(":")
  if (colon === -1) return null

  const source = decoded.slice(0, colon).trim()
  const ticker = decoded.slice(colon + 1).trim()
  if (!source || !ticker) return null

  return { source, ticker }
}

/** Encode symbol for sharing — always `SOURCE:TICKER` so exchanges don't collide. */
export function formatChartSymbolParam(symbol: PartialSymbolInfo): string | null {
  const ticker = String(symbol.ticker ?? "").trim()
  const source = String(symbol.source ?? "").trim()
  if (!ticker || !source) return null

  return `${source.toUpperCase()}:${ticker}`
}

export function symbolFromChartParam(param: string): PartialSymbolInfo | null {
  const parsed = parseChartSymbolParam(param)
  if (!parsed) return null

  return {
    ticker: parsed.ticker,
    source: parsed.source.toLowerCase(),
  }
}

/** Attach a source when the UI only passed a bare ticker (e.g. legacy watchlist). */
export function ensureChartSymbolSource(
  symbol: PartialSymbolInfo,
  fallback: PartialSymbolInfo = defaultSymbol,
): PartialSymbolInfo {
  const source = String(symbol.source ?? "").trim()
  if (source) return symbol

  const ticker = String(symbol.ticker ?? "").trim()
  const fallbackSource = String(
    fallback.source ?? defaultSymbol.source ?? "binance",
  ).trim()

  if (ticker && fallback.ticker === ticker && fallback.source) {
    return { ...symbol, source: fallback.source }
  }

  return { ...symbol, source: fallbackSource }
}

/** URL param wins over persisted symbol so shared links open the same market. */
export function resolveInitialChartSymbol(
  urlParam: string | null,
  persisted: PartialSymbolInfo,
): PartialSymbolInfo {
  if (urlParam) {
    const fromUrl = symbolFromChartParam(urlParam)
    if (fromUrl) return fromUrl
  }
  return ensureChartSymbolSource(persisted)
}

export type ChartWatchlistEntry = {
  source: string
  ticker: string
}

export function formatWatchlistEntry(entry: ChartWatchlistEntry): string {
  return `${entry.source}:${entry.ticker}`
}

export function parseWatchlistEntry(raw: string): ChartWatchlistEntry | null {
  const parsed = parseChartSymbolParam(raw)
  if (!parsed) return null
  return { source: parsed.source.toLowerCase(), ticker: parsed.ticker }
}

export function migrateWatchlistEntries(raw: unknown): ChartWatchlistEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return []

  if (typeof raw[0] === "string") {
    return (raw as string[]).map((ticker) => ({
      source: "binance",
      ticker: ticker.trim().toUpperCase(),
    }))
  }

  if (
    typeof raw[0] === "object" &&
    raw[0] !== null &&
    "ticker" in raw[0]
  ) {
    return (raw as ChartWatchlistEntry[]).map((entry) => ({
      source: String(entry.source ?? "binance").toLowerCase(),
      ticker: String(entry.ticker).trim().toUpperCase(),
    }))
  }

  return []
}

export function watchlistEntryKey(entry: ChartWatchlistEntry): string {
  return formatWatchlistEntry(entry).toUpperCase()
}

export function isSameChartSymbol(
  a: PartialSymbolInfo | null | undefined,
  b: ChartWatchlistEntry | PartialSymbolInfo | null | undefined,
): boolean {
  if (!a?.ticker || !b?.ticker) return false
  const aSource = String(a.source ?? "").toLowerCase()
  const bSource = String(b.source ?? "").toLowerCase()
  return (
    a.ticker.toUpperCase() === b.ticker.toUpperCase() && aSource === bSource
  )
}
