import { createContext } from "react";
import type { Chart } from "klinecharts";

export interface KLineChartContextValue {
  chart: Chart | null;
}

export const KLineChartContext = createContext<KLineChartContextValue>({
  chart: null,
});
