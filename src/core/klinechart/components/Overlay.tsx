import { useOverlay } from "../hooks/useOverlay";
import type { UseOverlayOptions } from "../hooks/useOverlay";

export type OverlayProps = UseOverlayOptions;

/**
 * Declarative overlay management as a child of `<KLineChart>`.
 * Renders nothing — purely manages the overlay lifecycle.
 *
 * @example
 * ```tsx
 * <KLineChart data={data}>
 *   <KLineChart.Overlay value="segment" />
 *   <KLineChart.Overlay value={{ name: "priceLine", points: [{ value: 100 }] }} />
 * </KLineChart>
 * ```
 */
export function Overlay(props: OverlayProps): null {
  useOverlay(props);
  return null;
}

Overlay.displayName = "KLineChart.Overlay";
