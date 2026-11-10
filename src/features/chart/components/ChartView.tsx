import { useCallback, useEffect, useMemo, useRef } from "react";
import { KLineChart } from "@/core/klinechart";
import type { Chart } from "@/core/klinechart";
import { useKlinechartsUI } from "@/core/headless";
import { createChartDataLoader } from "@/features/chart/lib/create-chart-data-loader";
import { useChartCandleTypes } from "@/features/chart/hooks/use-chart-candle-types";
import {
  BarChart3,
  Bell,
  Camera,
  Settings2,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  chartContextMenuContentClass,
  chartContextMenuIconClass,
  chartContextMenuItemClass,
} from "@/features/chart/components/chart-context-menu";
import { cn } from "@/lib/utils";
import { useTerminalActions } from "./actions";
import { ChartBuySell } from "./ChartBuySell";
import { ChartRRTool } from "./ChartRRTool";
import { SubIndicatorPaneControls } from "./SubIndicatorPaneControls";
import { MainIndicatorPaneControls } from "./MainIndicatorPaneControls";
import { ChartObjectContextMenu } from "./ChartObjectContextMenu";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import {
  ensurePositionOverlaysRegistered,
  upgradePositionOverlays,
} from "@/features/chart/lib/position-overlays";
import { ensureVpvrIndicatorRegistered } from "@/features/chart/lib/volume-profile/vpvr-indicator";
import { ensureFrvpOverlayRegistered } from "@/features/chart/lib/volume-profile/frvp-overlay";
import { useVpvrVisibleRangeRefresh } from "@/features/chart/hooks/use-vpvr-visible-range-refresh";
import { useChartTradeOverlays } from "@/features/chart/hooks/use-chart-trade-overlays";
import { getPersistedIndicatorParams } from "@/features/chart/utils/chart-indicator-persistence";
import { applyChartLegendLayout } from "@/features/chart/utils/chart-pane-legend-layout";
import { useIsChartPhoneLayout } from "@/features/chart/hooks/use-is-chart-phone-layout";

interface ChartViewProps {
  className?: string;
}

/**
 * Renders the KLineChart canvas wired to the registry datafeed, and restores
 * any active indicators when the chart (re)mounts.
 */
export function ChartView({ className }: ChartViewProps) {
  const { t } = useChartT();
  const { state, dispatch, datafeed } = useKlinechartsUI();
  const { heikinEnabled } = useChartCandleTypes();
  const { open, screenshot, tradeMode, rrMode } = useTerminalActions();
  const isPhone = useIsChartPhoneLayout();

  const dataLoader = useMemo(
    () => createChartDataLoader(datafeed, dispatch, heikinEnabled),
    [datafeed, dispatch, heikinEnabled],
  );

  // Read latest indicator lists in onReady without re-creating the callback.
  const mainIndicatorsRef = useRef(state.mainIndicators);
  const subIndicatorsRef = useRef(state.subIndicators);
  useEffect(() => {
    mainIndicatorsRef.current = state.mainIndicators;
    subIndicatorsRef.current = state.subIndicators;
  }, [state.mainIndicators, state.subIndicators]);

  // Theme reload can restore native tooltips — keep layout in sync with viewport.
  useEffect(() => {
    if (state.chart) applyChartLegendLayout(state.chart, isPhone);
  }, [state.chart, state.theme, isPhone]);

  useVpvrVisibleRangeRefresh(state.chart, state.mainIndicators);
  useChartTradeOverlays(tradeMode);

  const handleReady = useCallback(
    (chart: Chart) => {
      ensureVpvrIndicatorRegistered();
      ensureFrvpOverlayRegistered();
      ensurePositionOverlaysRegistered();
      upgradePositionOverlays(chart);
      applyChartLegendLayout(chart, isPhone);
      dispatch({ type: "SET_CHART", chart });

      mainIndicatorsRef.current.forEach((name) => {
        const calcParams = getPersistedIndicatorParams(name);
        chart.createIndicator(
          {
            name,
            id: `main_${name}`,
            paneId: "candle_pane",
            ...(calcParams ? { calcParams } : {}),
          },
          true,
        );
      });

      const subUpdates: Record<string, string> = {};
      Object.keys(subIndicatorsRef.current).forEach((name) => {
        const id = `sub_${name}`;
        const calcParams = getPersistedIndicatorParams(name);
        chart.createIndicator({
          name,
          id,
          ...(calcParams ? { calcParams } : {}),
        });
        const ind = chart.getIndicators({ id })[0];
        if (ind?.paneId) subUpdates[name] = ind.paneId;
      });
      if (Object.keys(subUpdates).length > 0) {
        dispatch({
          type: "SET_SUB_INDICATORS",
          indicators: { ...subIndicatorsRef.current, ...subUpdates },
        });
      }
    },
    [dispatch, isPhone],
  );

  // Price under the last right-click, used to prefill the alert / order-line dialogs.
  const containerRef = useRef<HTMLDivElement>(null);
  const clickPriceRef = useRef<number | null>(null);
  const capturePrice = (e: React.MouseEvent) => {
    const el = containerRef.current;
    const chart = state.chart;
    if (!el || !chart) return;
    const rect = el.getBoundingClientRect();
    const res = chart.convertFromPixel([{ x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    const pt = Array.isArray(res) ? res[0] : res;
    if (typeof pt?.value === "number") {
      const prec = state.symbol?.pricePrecision ?? 2;
      clickPriceRef.current = Number(pt.value.toFixed(prec));
    } else {
      clickPriceRef.current = null;
    }
  };
  const priceOpts = () =>
    clickPriceRef.current != null ? { price: clickPriceRef.current } : undefined;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={containerRef}
          onContextMenu={capturePrice}
          className={cn("relative h-full w-full", className)}
        >
          <KLineChart
            className="absolute inset-0"
            dataLoader={dataLoader}
            symbol={state.symbol ?? undefined}
            period={state.period}
            locale={state.locale}
            timezone={state.timezone}
            styles={state.theme}
            onReady={handleReady}
          >
            <SubIndicatorPaneControls />
            <MainIndicatorPaneControls />
          </KLineChart>
          {tradeMode && <ChartBuySell />}
          {rrMode && <ChartRRTool />}
          <ChartObjectContextMenu />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className={chartContextMenuContentClass}>
        <ContextMenuItem className={chartContextMenuItemClass} onClick={() => open("indicators")}>
          <span className={chartContextMenuIconClass}>
            <BarChart3 />
          </span>
          {t("toolbar.indicators")}
        </ContextMenuItem>
        <ContextMenuItem className={chartContextMenuItemClass} onClick={() => open("alerts", priceOpts())}>
          <span className={chartContextMenuIconClass}>
            <Bell />
          </span>
          {t("menu.addAlert")}
        </ContextMenuItem>
        <ContextMenuItem className={chartContextMenuItemClass} onClick={() => open("orderLines", priceOpts())}>
          <span className={chartContextMenuIconClass}>
            <TrendingUp />
          </span>
          {t("menu.orderLine")}
        </ContextMenuItem>
        <ContextMenuSeparator className="my-1 bg-border/70" />
        <ContextMenuItem className={chartContextMenuItemClass} onClick={() => open("settings")}>
          <span className={chartContextMenuIconClass}>
            <Settings2 />
          </span>
          {t("toolbar.settings")}
        </ContextMenuItem>
        <ContextMenuItem className={chartContextMenuItemClass} onClick={screenshot}>
          <span className={chartContextMenuIconClass}>
            <Camera />
          </span>
          {t("toolbar.screenshot")}
        </ContextMenuItem>
        <ContextMenuSeparator className="my-1 bg-border/70" />
        <ContextMenuItem
          className={chartContextMenuItemClass}
          onClick={() => state.chart?.scrollToRealTime?.(0)}
        >
          <span className={chartContextMenuIconClass}>
            <Zap />
          </span>
          {t("menu.toRealtime")}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
