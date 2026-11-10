import { useContext } from "react";
import type { Chart } from "klinecharts";
import { KLineChartContext } from "../KLineChartContext";

/**
 * Access the KlineCharts `Chart` instance from any descendant of `<KLineChart>`.
 * Returns `null` before the chart has initialized.
 */
export function useKLineChart(): Chart | null {
  const { chart } = useContext(KLineChartContext);
  return chart;
}
