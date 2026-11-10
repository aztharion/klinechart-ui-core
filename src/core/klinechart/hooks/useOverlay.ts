import { useEffect, useRef, useId } from "react";
import type { OverlayCreate, Nullable } from "klinecharts";
import { useKLineChart } from "./useKLineChart";

export interface UseOverlayOptions {
  /** Overlay name, creation config, or an array for batch creation. */
  value: string | OverlayCreate | Array<string | OverlayCreate>;
}

/**
 * Manages the lifecycle of overlay(s) (drawing tools).
 * Creates on mount, removes on unmount, and overrides config on change.
 *
 * @returns The overlay ID(s), or `null`.
 */
export function useOverlay(
  options: UseOverlayOptions
): Nullable<string> | Array<Nullable<string>> {
  const chart = useKLineChart();
  const idsRef = useRef<Nullable<string> | Array<Nullable<string>>>(null);
  const { value } = options;

  const valueKey = typeof value === "string" ? value : JSON.stringify(value);

  const overlayId = useId();
  const isBatch = Array.isArray(value);
  const isString = typeof value === "string";
  const baseName = isString
    ? value
    : isBatch
      ? "batch"
      : (value as OverlayCreate).name;

  useEffect(() => {
    if (!chart || !baseName) return;

    let createConfig = value;
    // Inject stable ID for single object configs so we can override them later
    if (!isBatch && !isString) {
      createConfig = { ...(value as OverlayCreate), id: overlayId };
    }

    idsRef.current = chart.createOverlay(createConfig);

    return () => {
      if (!chart) return;
      const ids = Array.isArray(idsRef.current)
        ? idsRef.current
        : [idsRef.current];
      ids.forEach((id) => {
        if (id) chart.removeOverlay({ id });
      });
      idsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, baseName, isBatch, overlayId]);

  // Override when value config changes (only for object configs)
  useEffect(() => {
    if (!chart || isString || isBatch) return;
    chart.overrideOverlay({ ...(value as OverlayCreate), id: overlayId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, valueKey, isString, isBatch, overlayId]);

  return idsRef.current;
}
