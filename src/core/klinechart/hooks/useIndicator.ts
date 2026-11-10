import { useEffect, useId, useRef } from "react";
import type {
  IndicatorCreate,
  PaneOptions,
  YAxisOverride,
  Nullable,
} from "klinecharts";
import { useKLineChart } from "./useKLineChart";

export interface UseIndicatorOptions {
  /** Indicator name or full creation config. */
  value: string | IndicatorCreate;
  /** Whether to stack on existing indicators in the same pane. */
  isStack?: boolean;
  /** Pane options for the indicator pane. */
  pane?: PaneOptions;
  /** Y axis override for the indicator pane. */
  yAxis?: YAxisOverride;
  /**
   * Pane options for the indicator pane.
   * @deprecated Renamed to `pane` to match KLineCharts v10. Use `pane` instead.
   */
  paneOptions?: PaneOptions;
}

/**
 * Manages the lifecycle of a technical indicator.
 * Creates the indicator on mount, removes it on unmount, and overrides its
 * config when `value` changes.
 *
 * @returns The pane ID the indicator was added to, or `null`.
 */
export function useIndicator(options: UseIndicatorOptions): Nullable<string> {
  const chart = useKLineChart();
  const paneIdRef = useRef<Nullable<string>>(null);
  const { value, isStack, pane, paneOptions, yAxis } = options;

  // Stable unique ID per component instance — survives re-renders,
  // guarantees cleanup removes exactly the indicator we created.
  const indicatorId = useId();

  // Name is the base identity. If this changes, we must recreate.
  const indicatorName = typeof value === "string" ? value : value.name;

  // Serialize value for dependency comparison (small config objects)
  const valueKey = typeof value === "string" ? value : JSON.stringify(value);

  useEffect(() => {
    if (!chart || !indicatorName) return;

    const paneId = (pane ?? paneOptions)?.id;
    const create: IndicatorCreate =
      typeof value === "string"
        ? { name: value, id: indicatorId, ...(paneId ? { paneId } : {}) }
        : { ...value, id: indicatorId, ...(paneId ? { paneId } : {}) };

    paneIdRef.current = chart.createIndicator(create, isStack);

    return () => {
      chart.removeIndicator({ id: indicatorId });
      paneIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, indicatorName, isStack, indicatorId]);

  // Override indicator config when value object changes
  useEffect(() => {
    if (!chart || typeof value === "string") return;
    chart.overrideIndicator({ ...value, id: indicatorId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, valueKey, indicatorId]);

  return paneIdRef.current;
}
