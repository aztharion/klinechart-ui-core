import { useEffect } from "react";
import { KLineChart } from "@/core/klinechart";
import { useIndicators, useKlinechartsUI } from "@/core/headless";
import { IndicatorLegendChip } from "@/features/chart/components/indicator-legend-chip";
import { useChartCrosshairIndex } from "@/features/chart/hooks/use-chart-crosshair-index";
import { useChartPaneLegendInset } from "@/features/chart/hooks/use-chart-pane-legend-inset";
import { useIsChartPhoneLayout } from "@/features/chart/hooks/use-is-chart-phone-layout";
import { applyChartLegendLayout } from "@/features/chart/utils/chart-pane-legend-layout";
import { cn } from "@/lib/utils";

/** All indicator legends — stacked top-left on the main pane, below the native OHLC readout. */
export function MainIndicatorPaneControls() {
  const { state } = useKlinechartsUI();
  const ind = useIndicators();
  const dataIndex = useChartCrosshairIndex();
  const inset = useChartPaneLegendInset();
  const isPhone = useIsChartPhoneLayout();

  const mainNames = ind.activeMainIndicators;
  const subEntries = Object.entries(ind.activeSubIndicators).filter(([, paneId]) => Boolean(paneId));

  useEffect(() => {
    if (!state.chart) return;
    applyChartLegendLayout(state.chart, isPhone);
  }, [state.chart, state.theme, isPhone, mainNames.length, subEntries.length]);

  if (mainNames.length === 0 && subEntries.length === 0) return null;

  return (
    <KLineChart.Widget paneId="candle_pane" position="main">
      <div
        className={cn(
          "chart-pane-legend pointer-events-none absolute z-20 flex max-w-[calc(100%-1rem)] flex-col items-start",
          isPhone ? "gap-1.5" : "gap-1",
        )}
        style={{ left: inset.left, top: inset.top }}
      >
        {mainNames.map((name) => (
          <IndicatorLegendChip
            key={`main-${name}`}
            name={name}
            paneId="candle_pane"
            isMain
            dataIndex={dataIndex}
            chart={state.chart}
          />
        ))}
        {subEntries.map(([name, paneId]) => (
          <IndicatorLegendChip
            key={`sub-${name}-${paneId}`}
            name={name}
            paneId={paneId}
            isMain={false}
            dataIndex={dataIndex}
            chart={state.chart}
          />
        ))}
      </div>
    </KLineChart.Widget>
  );
}
