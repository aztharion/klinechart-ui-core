import { registerIndicator } from "@/core/klinechart";
import type { Chart } from "@/core/klinechart";
import { computeVolumeProfile } from "./compute";
import { toVolumeProfileBar } from "./bar";
import { drawVolumeProfileCanvas } from "./draw-volume-profile";
import type { VolumeProfileResult } from "./types";
import {
  VPVR_DEFAULT_CALC_PARAMS,
  VPVR_INDICATOR_NAME,
  parseVpvrCalcParams,
} from "./types";

const vpvrSnapshots = new WeakMap<Chart, VolumeProfileResult>();

export function getVpvrSnapshot(chart: Chart): VolumeProfileResult | undefined {
  return vpvrSnapshots.get(chart);
}

let registered = false;

export function ensureVpvrIndicatorRegistered(): void {
  if (registered) return;

  registerIndicator({
    name: VPVR_INDICATOR_NAME,
    shortName: "VP",
    series: "price",
    calcParams: [...VPVR_DEFAULT_CALC_PARAMS],
    figures: [
      { key: "poc", title: "POC: ", type: "line" },
      { key: "vah", title: "VAH: ", type: "line" },
      { key: "val", title: "VAL: ", type: "line" },
    ],
    zLevel: 1,
    calc: () => [],
    shouldUpdate: () => false,
    draw: ({ ctx, chart, indicator, bounding, yAxis }) => {
      if (!yAxis) return true;

      const visibleRange = chart.getVisibleRange();
      const dataList = chart.getDataList();
      const from = Math.max(0, visibleRange.from);
      const to = Math.min(dataList.length - 1, visibleRange.to);
      if (to < from) {
        vpvrSnapshots.delete(chart);
        return true;
      }

      const slice = dataList.slice(from, to + 1);
      const bars = slice.map((bar) => toVolumeProfileBar(bar));
      const config = parseVpvrCalcParams(indicator.calcParams as number[]);
      const result = computeVolumeProfile(bars, config);

      if (!result) {
        vpvrSnapshots.delete(chart);
        return true;
      }

      vpvrSnapshots.set(chart, result);

      let developingPocPrice: number | undefined;
      if (bars.length >= 2) {
        const settled = computeVolumeProfile(bars.slice(0, -1), config);
        developingPocPrice = settled?.pocPrice;
      }

      drawVolumeProfileCanvas(ctx, result, config, bounding, yAxis, { developingPocPrice });
      return true;
    },
  });

  registered = true;
}
