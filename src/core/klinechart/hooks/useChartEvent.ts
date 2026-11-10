import { useEffect, useRef } from "react";
import type { ActionType, ActionCallback } from "klinecharts";
import { useKLineChart } from "./useKLineChart";

/**
 * Subscribe to a chart action event.
 * Uses a stable ref-based handler to avoid re-subscribing when the callback
 * identity changes between renders.
 */
export function useChartEvent(
  type: ActionType,
  callback: ActionCallback
): void {
  const chart = useKLineChart();
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!chart) return;

    const handler: ActionCallback = (data) => {
      callbackRef.current(data);
    };

    chart.subscribeAction(type, handler);
    return () => {
      chart.unsubscribeAction(type, handler);
    };
  }, [chart, type]);
}
