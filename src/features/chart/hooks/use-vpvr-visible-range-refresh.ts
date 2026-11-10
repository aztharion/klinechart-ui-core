import { useEffect } from "react";
import type { Chart } from "@/core/klinechart";
import { VPVR_INDICATOR_NAME } from "@/features/chart/lib/volume-profile/types";

/** Force VPVR redraw when the visible range changes (pan/zoom). */
export function useVpvrVisibleRangeRefresh(
  chart: Chart | null,
  mainIndicators: string[],
): void {
  useEffect(() => {
    if (!chart || !mainIndicators.includes(VPVR_INDICATOR_NAME)) return;

    const refresh = () => {
      chart.overrideIndicator({ id: `main_${VPVR_INDICATOR_NAME}`, name: VPVR_INDICATOR_NAME });
    };

    chart.subscribeAction("onVisibleRangeChange", refresh);
    chart.subscribeAction("onScroll", refresh);
    chart.subscribeAction("onZoom", refresh);

    return () => {
      chart.unsubscribeAction("onVisibleRangeChange", refresh);
      chart.unsubscribeAction("onScroll", refresh);
      chart.unsubscribeAction("onZoom", refresh);
    };
  }, [chart, mainIndicators]);
}
