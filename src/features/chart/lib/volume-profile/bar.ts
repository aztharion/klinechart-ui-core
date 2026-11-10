import type { KLineData } from "@/core/klinechart";
import type { VolumeProfileBar } from "./types";

export interface RawOhlcKLineData extends KLineData {
  _rawOpen?: number;
  _rawHigh?: number;
  _rawLow?: number;
  _rawClose?: number;
}

/** Use underlying OHLC when Heikin Ashi transformed bars are on the chart. */
export function toVolumeProfileBar(bar: RawOhlcKLineData): VolumeProfileBar {
  return {
    open: bar._rawOpen ?? bar.open,
    high: bar._rawHigh ?? bar.high,
    low: bar._rawLow ?? bar.low,
    close: bar._rawClose ?? bar.close,
    volume: bar.volume ?? 0,
  };
}
