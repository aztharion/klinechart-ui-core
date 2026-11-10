import type { Chart } from "@/core/klinechart";

/** Hide canvas indicator tooltips — custom React legend replaces them. */
export function suppressNativeIndicatorTooltips(chart: Chart): void {
  chart.setStyles({
    indicator: {
      tooltip: {
        showRule: "none",
        title: { show: false, showName: false, showParams: false },
        legend: { marginLeft: 0, marginTop: 0, marginBottom: 0 },
      },
    },
  });
}

/** Keep native candle + indicator tooltips aligned with the React legend layer. */
export function applyChartLegendLayout(chart: Chart, isPhone: boolean): void {
  suppressNativeIndicatorTooltips(chart);
  chart.setStyles({
    candle: {
      tooltip: {
        showRule: isPhone ? "none" : "always",
      },
    },
  });
}
