import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type Ref,
} from "react";
import {
  init,
  dispose,
  type Chart,
  type ActionCallback,
  type ActionType,
} from "klinecharts";

import { KLineChartContext } from "./KLineChartContext";
import { Indicator } from "./components/Indicator";
import { Overlay } from "./components/Overlay";
import { Widget } from "./components/Widget";
import type { KLineChartProps } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function updateForwardedRef(ref: Ref<Chart> | undefined, chart: Chart | null) {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(chart);
  } else {
    (ref as React.MutableRefObject<Chart | null>).current = chart;
  }
}

/**
 * Subscribes to a chart action using a stable handler.
 * The latest callback is always read from a ref to avoid re-subscribing on
 * every render.
 */
function useActionSubscription(
  chart: Chart | null,
  actionType: ActionType,
  callback: ActionCallback | undefined
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!chart) return;

    const handler: ActionCallback = (data) => {
      callbackRef.current?.(data);
    };

    chart.subscribeAction(actionType, handler);
    return () => {
      chart.unsubscribeAction(actionType, handler);
    };
  }, [chart, actionType]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const KLineChartInner = forwardRef<Chart, KLineChartProps>(
  (
    {
      // Init-only
      options,

      // Data
      data,
      dataLoader,
      symbol,
      period,

      // Reactive
      styles,
      locale,
      timezone,
      formatter,
      thousandsSeparator,
      decimalFold,
      zoomEnabled,
      scrollEnabled,
      zoomAnchor,
      offsetRightDistance,
      maxOffsetLeftDistance,
      maxOffsetRightDistance,
      leftMinVisibleBarCount,
      rightMinVisibleBarCount,
      barSpace,

      // Events
      onReady,
      onZoom,
      onScroll,
      onVisibleRangeChange,
      onCrosshairChange,
      onCandleBarClick,
      onPaneDrag,
      onCandleTooltipFeatureClick,
      onIndicatorTooltipFeatureClick,
      onCrosshairFeatureClick,

      // Children (sub-components)
      children,

      // HTML div passthrough
      ...divProps
    },
    ref
  ) => {
    const chartRef = useRef<Chart | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [chart, setChart] = useState<Chart | null>(null);

    // Keep a stable ref to onReady so we don't re-trigger init
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    // ---- Resize observation (native ResizeObserver) ----
    const handleResize = useCallback(() => {
      chartRef.current?.resize();
    }, []);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const observer = new ResizeObserver(handleResize);
      observer.observe(el);
      return () => observer.disconnect();
    }, [handleResize]);

    // ---- Initialization (mount-only, StrictMode-safe) ----
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Dispose any leftover chart from a previous StrictMode cycle
      if (chartRef.current) {
        dispose(container);
        chartRef.current = null;
      }

      const instance = init(container, options);
      if (!instance) return;

      chartRef.current = instance;
      setChart(instance);
      updateForwardedRef(ref, instance);
      onReadyRef.current?.(instance);

      return () => {
        dispose(container);
        chartRef.current = null;
        setChart(null);
        updateForwardedRef(ref, null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Ref sync ----
    useEffect(() => {
      updateForwardedRef(ref, chartRef.current);
    }, [ref]);

    // ---- Data ----
    // Symbol and period use serialized keys instead of object references
    // to avoid unnecessary data reloads when consumers pass inline objects.
    const symbolKey = symbol ? JSON.stringify(symbol) : "";
    const periodKey = period ? JSON.stringify(period) : "";

    useEffect(() => {
      if (!chart) return;
      if (dataLoader) {
        chart.setDataLoader(dataLoader);
      } else if (data) {
        // Fallback or static data array setter for v10 API
        chart.setDataLoader({
          getBars: ({ callback }) => {
            callback(data, false);
          },
        });
      }
    }, [chart, data, dataLoader]);

    useEffect(() => {
      if (!chart || !symbol) return;
      chart.setSymbol(symbol);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chart, symbolKey]);

    useEffect(() => {
      if (!chart || !period) return;
      chart.setPeriod(period);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chart, periodKey]);

    // ---- Reactive props ----
    useEffect(() => {
      if (!chart || styles === undefined) return;
      chart.setStyles(styles);
    }, [chart, styles]);

    useEffect(() => {
      if (!chart || locale === undefined) return;
      chart.setLocale(locale);
    }, [chart, locale]);

    useEffect(() => {
      if (!chart || timezone === undefined) return;
      chart.setTimezone(timezone);
    }, [chart, timezone]);

    useEffect(() => {
      if (!chart || formatter === undefined) return;
      chart.setFormatter(formatter);
    }, [chart, formatter]);

    useEffect(() => {
      if (!chart || thousandsSeparator === undefined) return;
      chart.setThousandsSeparator(thousandsSeparator);
    }, [chart, thousandsSeparator]);

    useEffect(() => {
      if (!chart || decimalFold === undefined) return;
      chart.setDecimalFold(decimalFold);
    }, [chart, decimalFold]);

    useEffect(() => {
      if (!chart || zoomEnabled === undefined) return;
      chart.setZoomEnabled(zoomEnabled);
    }, [chart, zoomEnabled]);

    useEffect(() => {
      if (!chart || scrollEnabled === undefined) return;
      chart.setScrollEnabled(scrollEnabled);
    }, [chart, scrollEnabled]);

    useEffect(() => {
      if (!chart || zoomAnchor === undefined) return;
      const resolved =
        typeof zoomAnchor === "string"
          ? { main: zoomAnchor, xAxis: zoomAnchor }
          : {
              main: "cursor" as const,
              xAxis: "cursor" as const,
              ...zoomAnchor,
            };
      chart.setZoomAnchor(resolved);
    }, [chart, zoomAnchor]);

    useEffect(() => {
      if (!chart || offsetRightDistance === undefined) return;
      chart.setOffsetRightDistance(offsetRightDistance);
    }, [chart, offsetRightDistance]);

    useEffect(() => {
      if (!chart || maxOffsetLeftDistance === undefined) return;
      chart.setMaxOffsetLeftDistance(maxOffsetLeftDistance);
    }, [chart, maxOffsetLeftDistance]);

    useEffect(() => {
      if (!chart || maxOffsetRightDistance === undefined) return;
      chart.setMaxOffsetRightDistance(maxOffsetRightDistance);
    }, [chart, maxOffsetRightDistance]);

    useEffect(() => {
      if (!chart || leftMinVisibleBarCount === undefined) return;
      chart.setLeftMinVisibleBarCount(leftMinVisibleBarCount);
    }, [chart, leftMinVisibleBarCount]);

    useEffect(() => {
      if (!chart || rightMinVisibleBarCount === undefined) return;
      chart.setRightMinVisibleBarCount(rightMinVisibleBarCount);
    }, [chart, rightMinVisibleBarCount]);

    useEffect(() => {
      if (!chart || barSpace === undefined) return;
      chart.setBarSpace(barSpace);
    }, [chart, barSpace]);

    // ---- Event subscriptions ----
    useActionSubscription(chart, "onZoom", onZoom);
    useActionSubscription(chart, "onScroll", onScroll);
    useActionSubscription(chart, "onVisibleRangeChange", onVisibleRangeChange);
    useActionSubscription(chart, "onCrosshairChange", onCrosshairChange);
    useActionSubscription(chart, "onCandleBarClick", onCandleBarClick);
    useActionSubscription(chart, "onPaneDrag", onPaneDrag);
    useActionSubscription(
      chart,
      "onCandleTooltipFeatureClick",
      onCandleTooltipFeatureClick
    );
    useActionSubscription(
      chart,
      "onIndicatorTooltipFeatureClick",
      onIndicatorTooltipFeatureClick
    );
    useActionSubscription(
      chart,
      "onCrosshairFeatureClick",
      onCrosshairFeatureClick
    );

    // ---- Render ----
    return (
      <KLineChartContext.Provider value={{ chart }}>
        <div {...divProps} ref={containerRef} />
        {!!chart && children}
      </KLineChartContext.Provider>
    );
  }
);

KLineChartInner.displayName = "KLineChart";

// Attach sub-components as static properties
export const KLineChart = Object.assign(KLineChartInner, {
  Indicator,
  Overlay,
  Widget,
});
