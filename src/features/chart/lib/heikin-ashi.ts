import type { KLineData } from "@/core/klinechart";

export interface RawOhlcKLineData extends KLineData {
  _rawOpen?: number;
  _rawHigh?: number;
  _rawLow?: number;
  _rawClose?: number;
}

/** Single-bar Heikin Ashi transform (cTrader / TradingView formula). */
export function toHeikinAshiBar(raw: KLineData, prevHa: KLineData | null): RawOhlcKLineData {
  const haClose = (raw.open + raw.high + raw.low + raw.close) / 4;
  const haOpen = prevHa
    ? (prevHa.open + prevHa.close) / 2
    : (raw.open + raw.close) / 2;
  const haHigh = Math.max(raw.high, haOpen, haClose);
  const haLow = Math.min(raw.low, haOpen, haClose);

  return {
    ...raw,
    open: haOpen,
    high: haHigh,
    low: haLow,
    close: haClose,
    _rawOpen: raw.open,
    _rawHigh: raw.high,
    _rawLow: raw.low,
    _rawClose: raw.close,
  };
}

/** Batch transform preserving chronological order. */
export function toHeikinAshi(bars: KLineData[]): KLineData[] {
  const out: KLineData[] = [];
  let prev: KLineData | null = null;
  for (const bar of bars) {
    const ha = toHeikinAshiBar(bar, prev);
    out.push(ha);
    prev = ha;
  }
  return out;
}
