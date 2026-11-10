import { createDataLoader } from "@/core/headless";
import type { Datafeed, KlinechartsUIAction } from "@/core/headless";
import type { DataLoader, KLineData } from "@/core/klinechart";
import { toHeikinAshiBar } from "./heikin-ashi";

type Dispatch = (action: KlinechartsUIAction) => void;

/**
 * Wraps the terminal datafeed loader and optionally transforms OHLC into
 * Heikin Ashi before bars reach the chart.
 */
export function createChartDataLoader(
  datafeed: Datafeed,
  dispatch: Dispatch,
  heikinEnabled: boolean,
): DataLoader {
  const base = createDataLoader(datafeed, dispatch);

  if (!heikinEnabled) {
    return base;
  }

  /** Last completed HA bar (used as prev for the forming bar). */
  let prevCompletedHa: KLineData | null = null;
  /** HA of the currently forming bar. */
  let formingHa: KLineData | null = null;

  return {
    getBars: async (params) => {
      if (params.type === "init") {
        prevCompletedHa = null;
        formingHa = null;
      }

      await base.getBars({
        ...params,
        callback: (data, meta) => {
          if (data.length === 0) {
            params.callback(data, meta);
            return;
          }

          const transformed: KLineData[] = [];
          let chain: KLineData | null = null;
          for (const bar of data) {
            const ha = toHeikinAshiBar(bar, chain);
            transformed.push(ha);
            chain = ha;
          }

          if (params.type === "init") {
            prevCompletedHa = chain;
            formingHa = chain;
          }

          params.callback(transformed, meta);
        },
      });
    },

    subscribeBar: (params) => {
      base.subscribeBar?.({
        ...params,
        callback: (raw) => {
          if (formingHa != null && raw.timestamp > formingHa.timestamp) {
            prevCompletedHa = formingHa;
          }

          const prev = prevCompletedHa;
          const ha = toHeikinAshiBar(raw, prev);
          formingHa = ha;
          params.callback(ha);
        },
      });
    },

    unsubscribeBar: (params) => {
      base.unsubscribeBar?.(params);
    },
  };
}
