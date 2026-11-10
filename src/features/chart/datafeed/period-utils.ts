import type { TerminalPeriod } from "./types";
export function getTradeSymbolPricePrecision(symbol?: string): number {
  const normalized = symbol?.trim().toUpperCase();
  switch (normalized) {
    case "USDJPY":
      return 3;
    case "XAUUSD":
    case "BTCUSD":
    case "ETHUSD":
      return 2;
    default:
      return 5;
  }
}

/** Map terminal period to backend OHLC timeframe string. */
export function periodToBackendTimeframe(period: TerminalPeriod): string {
  const { span, type } = period;
  switch (type) {
    case "minute":
      return `${span}m`;
    case "hour":
      return `${span}h`;
    case "day":
      return `${span}d`;
    case "week":
      return `${span}w`;
    case "month":
      return `${span}M`;
    default:
      return "15m";
  }
}

export function backendSymbolPrecision(code: string): number {
  return getTradeSymbolPricePrecision(code);
}

/** Convert klinecharts ms timestamps to backend unix seconds. */
export function msToUnixSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/** Convert backend unix seconds to klinecharts ms timestamp. */
export function unixSecondsToMs(seconds: number): number {
  return seconds * 1000;
}
