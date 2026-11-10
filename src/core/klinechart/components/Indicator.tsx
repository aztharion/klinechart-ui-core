import { useIndicator } from "../hooks/useIndicator";
import type { UseIndicatorOptions } from "../hooks/useIndicator";

export type IndicatorProps = UseIndicatorOptions;

/**
 * Declarative indicator management as a child of `<KLineChart>`.
 * Renders nothing — purely manages the indicator lifecycle.
 *
 * @example
 * ```tsx
 * <KLineChart data={data}>
 *   <KLineChart.Indicator value={{ name: "MA", calcParams: [5, 10, 30] }} />
 *   <KLineChart.Indicator value="VOL" pane={{ height: 80 }} />
 * </KLineChart>
 * ```
 */
export function Indicator(props: IndicatorProps): null {
  useIndicator(props);
  return null;
}

Indicator.displayName = "KLineChart.Indicator";
