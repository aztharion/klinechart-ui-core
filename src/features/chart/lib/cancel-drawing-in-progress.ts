import type { Chart } from "@/core/klinechart";

type ChartStore = {
  isOverlayDrawing?: () => boolean;
  getProgressOverlayInfo?: () => {
    overlay: { id: string; isDrawing: () => boolean };
  } | null;
};

type ChartWithStore = Chart & {
  getChartStore?: () => ChartStore;
};

/** True when the user is mid-stroke placing overlay points. */
export function isChartOverlayDrawing(chart: Chart | null | undefined): boolean {
  if (!chart) return false;
  return (chart as ChartWithStore).getChartStore?.()?.isOverlayDrawing?.() ?? false;
}

/** Remove the in-progress overlay and return whether anything was cancelled. */
export function cancelDrawingInProgress(chart: Chart | null | undefined): boolean {
  if (!chart) return false;
  const store = (chart as ChartWithStore).getChartStore?.();
  if (!store?.isOverlayDrawing?.()) return false;

  const progress = store.getProgressOverlayInfo?.();
  const id = progress?.overlay?.id;
  if (id) {
    chart.removeOverlay({ id });
    return true;
  }
  return false;
}

/** Cancel any in-progress stroke and activate the cursor (crosshair) tool. */
export function selectCursorMode(
  chart: Chart | null | undefined,
  clearActiveTool: () => void,
): void {
  cancelDrawingInProgress(chart);
  clearActiveTool();
}
