import { useCallback, useEffect, useState } from "react";
import { useKlinechartsUI } from "@/core/headless";

/** Crosshair bar index for reading indicator values at the hovered candle. */
export function useChartCrosshairIndex(): number | null {
  const { state } = useKlinechartsUI();
  const [dataIndex, setDataIndex] = useState<number | null>(null);

  const handler = useCallback((data?: unknown) => {
    const event = data as { dataIndex?: number } | undefined;
    setDataIndex(typeof event?.dataIndex === "number" ? event.dataIndex : null);
  }, []);

  useEffect(() => {
    const chart = state.chart;
    if (!chart) return;
    chart.subscribeAction?.("onCrosshairChange", handler);
    return () => chart.unsubscribeAction?.("onCrosshairChange", handler);
  }, [state.chart, handler]);

  return dataIndex;
}
