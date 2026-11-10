import { useMemo } from "react";
import type { Chart } from "@/core/klinechart";
import { useKlinechartsUI } from "@/core/headless";
import { useIsChartPhoneLayout } from "@/features/chart/hooks/use-is-chart-phone-layout";

function readTooltipInset(chart: Chart | null): { left: number; top: number } {
  if (!chart) return { left: 12, top: 50 };

  const candle = chart.getStyles().candle?.tooltip;
  const offsetLeft = candle?.offsetLeft ?? 4;
  const offsetTop = candle?.offsetTop ?? 6;
  const title = candle?.title;
  const legend = candle?.legend;

  const titleMarginTop = title?.marginTop ?? 4;
  const titleSize = title?.size ?? 14;
  const titleMarginBottom = title?.marginBottom ?? 4;
  const legendMarginTop = legend?.marginTop ?? 4;
  const legendSize = legend?.size ?? 12;
  const legendMarginBottom = legend?.marginBottom ?? 4;
  const legendMarginLeft = legend?.marginLeft ?? 8;

  const left = offsetLeft + legendMarginLeft;
  const top =
    offsetTop +
    titleMarginTop +
    titleSize +
    titleMarginBottom +
    legendMarginTop +
    legendSize +
    legendMarginBottom;

  return { left, top };
}

/** Pixel inset aligned with klinecharts native candle tooltip layout. */
export function useChartPaneLegendInset(): { left: number; top: number } {
  const isPhone = useIsChartPhoneLayout();
  const { state } = useKlinechartsUI();

  return useMemo(() => {
    if (isPhone) return { left: 8, top: 4 };
    return readTooltipInset(state.chart);
  }, [isPhone, state.chart, state.theme]);
}
