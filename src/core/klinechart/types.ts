import type {
  Chart,
  Options,
  Styles,
  IndicatorCreate,
  OverlayCreate,
  PaneOptions,
  YAxisOverride,
  Formatter,
  SymbolInfo,
  Period,
  ThousandsSeparator,
  DecimalFold,
  DataLoader,
  ActionCallback,
  ActionType,
  ZoomAnchor,
  ZoomAnchorType,
  DeepPartial,
  Nullable,
  IndicatorFilter,
  OverlayFilter,
  PickPartial,
  KLineData,
} from "klinecharts";
import type { HTMLAttributes, ReactNode, Ref } from "react";

// ---------------------------------------------------------------------------
// KLineChart component props
// ---------------------------------------------------------------------------

export interface KLineChartProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> {
  ref?: Ref<Chart>;
  children?: ReactNode;

  /** Chart initialization options (applied once on mount). */
  options?: Options;

  // -- Data ------------------------------------------------------------------

  /** Static data array to apply to the chart. Calls `applyNewData`. */
  data?: KLineData[];

  /** Data loader for fetching and subscribing to bar data. Calls `setDataLoader`. */
  dataLoader?: DataLoader;

  /** Symbol info (ticker, precision). Calls `setSymbol`. */
  symbol?: PickPartial<SymbolInfo, "pricePrecision" | "volumePrecision">;

  /** Time period. Calls `setPeriod`. */
  period?: Period;

  // -- Reactive props --------------------------------------------------------

  /** Chart styles. Calls `setStyles` on change. */
  styles?: string | DeepPartial<Styles>;

  /** Locale identifier. Calls `setLocale` on change. */
  locale?: string;

  /** IANA timezone string. Calls `setTimezone` on change. */
  timezone?: string;

  /** Custom formatters for dates and big numbers. Calls `setFormatter`. */
  formatter?: Partial<Formatter>;

  /** Thousands separator config. Calls `setThousandsSeparator`. */
  thousandsSeparator?: Partial<ThousandsSeparator>;

  /** Decimal fold config. Calls `setDecimalFold`. */
  decimalFold?: Partial<DecimalFold>;

  /** Enable/disable zoom. Calls `setZoomEnabled`. */
  zoomEnabled?: boolean;

  /** Enable/disable scroll. Calls `setScrollEnabled`. */
  scrollEnabled?: boolean;

  /** Zoom anchor config. Calls `setZoomAnchor`. */
  zoomAnchor?: ZoomAnchorType | Partial<ZoomAnchor>;

  /** Right offset distance in pixels. Calls `setOffsetRightDistance`. */
  offsetRightDistance?: number;

  /** Maximum left offset distance. Calls `setMaxOffsetLeftDistance`. */
  maxOffsetLeftDistance?: number;

  /** Maximum right offset distance. Calls `setMaxOffsetRightDistance`. */
  maxOffsetRightDistance?: number;

  /** Minimum visible bar count on the left. */
  leftMinVisibleBarCount?: number;

  /** Minimum visible bar count on the right. */
  rightMinVisibleBarCount?: number;

  /** Width of a single bar in pixels. Calls `setBarSpace`. */
  barSpace?: number;

  // -- Event callbacks -------------------------------------------------------

  /** Fired once the chart instance has been created. */
  onReady?: (chart: Chart) => void;

  /** Chart zoom event. */
  onZoom?: ActionCallback;

  /** Chart scroll event. */
  onScroll?: ActionCallback;

  /** Visible data range changed. */
  onVisibleRangeChange?: ActionCallback;

  /** Crosshair position changed. */
  onCrosshairChange?: ActionCallback;

  /** Candle bar clicked. */
  onCandleBarClick?: ActionCallback;

  /** Pane drag event. */
  onPaneDrag?: ActionCallback;

  /** Candle tooltip feature clicked. */
  onCandleTooltipFeatureClick?: ActionCallback;

  /** Indicator tooltip feature clicked. */
  onIndicatorTooltipFeatureClick?: ActionCallback;

  /** Crosshair feature clicked. */
  onCrosshairFeatureClick?: ActionCallback;
}

// ---------------------------------------------------------------------------
// Hook option types
// ---------------------------------------------------------------------------

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

export interface UseOverlayOptions {
  /** Overlay name, creation config, or an array for batch creation. */
  value: string | OverlayCreate | Array<string | OverlayCreate>;
}

// ---------------------------------------------------------------------------
// Re-exported convenience types
// ---------------------------------------------------------------------------

export type {
  ActionType,
  ActionCallback,
  IndicatorFilter,
  OverlayFilter,
  Nullable,
};
