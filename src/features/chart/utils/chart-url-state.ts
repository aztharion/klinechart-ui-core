import { DEFAULT_PERIODS } from "@/core/headless";
import type { TerminalPeriod } from "@/core/headless";
import type { PartialSymbolInfo } from "@/features/chart/datafeed";
import { defaultSymbol } from "@/features/chart/datafeed";
import {
  formatChartSymbolParam,
  resolveInitialChartSymbol,
} from "@/features/chart/utils/chart-symbol-url";
import { loadPersistedIndicators } from "@/features/chart/utils/chart-indicator-persistence";
import { loadPersisted } from "@/features/chart/hooks/use-persistent-state";

export const DEFAULT_CHART_PERIOD_LABEL = "15m";

/** Period from localStorage only; falls back to 15m (TradingView-style). */
export function resolveChartPeriod(): TerminalPeriod {
  const saved = loadPersisted<string | null>("period", null);
  if (saved) {
    const match = DEFAULT_PERIODS.find((p) => p.label === saved);
    if (match) return match;
  }
  return (
    DEFAULT_PERIODS.find((p) => p.label === DEFAULT_CHART_PERIOD_LABEL) ??
    DEFAULT_PERIODS[0]
  );
}

/** Shareable chart URL state — symbol + exchange only. */
export function buildChartSymbolSearchParams(
  symbol: PartialSymbolInfo,
): Record<string, string> {
  const value = formatChartSymbolParam(symbol);
  return value ? { symbol: value } : {};
}

export function syncChartSymbolToUrl(
  setSearchParams: (next: Record<string, string>, opts?: { replace?: boolean }) => void,
  symbol: PartialSymbolInfo,
): void {
  const next = buildChartSymbolSearchParams(symbol);
  if (Object.keys(next).length > 0) {
    setSearchParams(next, { replace: true });
  }
}

/** Bootstrap chart: URL symbol > localStorage; period + indicators from localStorage only. */
export function resolveInitialChartBootstrap(searchParams: URLSearchParams) {
  const symbol = resolveInitialChartSymbol(
    searchParams.get("symbol"),
    loadPersisted("symbol", defaultSymbol),
  );

  return {
    symbol,
    period: resolveChartPeriod(),
    indicators: loadPersistedIndicators(),
  };
}
