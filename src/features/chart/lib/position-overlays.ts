import { registerOverlay } from "@/core/klinechart";
import type { Chart, OverlayFigure, OverlayTemplate } from "@/core/klinechart";

type Side = "long" | "short";

const OVERLAY_DRAW_STEP_FINISHED = -1;

type CreateParams = {
  chart: Chart;
  overlay: {
    id: string;
    currentStep: number;
    points: Array<{ value?: number }>;
  };
  coordinates: Array<{ x: number; y: number }>;
  yAxis: {
    convertFromPixel: (px: number) => number;
  } | null;
};

type ClickOverlayInfo = {
  overlay?: { id: string };
  figureType: string;
};

type ChartWithStore = Chart & {
  getChartStore?: () => { getClickOverlayInfo: () => ClickOverlayInfo };
};

function isOverlaySelected(chart: Chart, overlayId: string): boolean {
  const info = (chart as ChartWithStore).getChartStore?.()?.getClickOverlayInfo();
  return info?.overlay?.id === overlayId && info.figureType !== "none";
}

function isOverlayComplete(overlay: CreateParams["overlay"]): boolean {
  return overlay.currentStep === OVERLAY_DRAW_STEP_FINISHED;
}

function formatPrice(value: number, precision: number): string {
  return value.toFixed(precision);
}

function createPositionFigures(side: Side, params: CreateParams): OverlayFigure[] {
  const { chart, coordinates, overlay, yAxis } = params;
  const figures: OverlayFigure[] = [];

  if (coordinates.length <= 1 || !yAxis) return figures;

  const startX = coordinates[0].x;
  const endX = coordinates[1].x;
  const entryY = coordinates[0].y;
  const targetY = coordinates[1].y;
  const stopY = coordinates.length > 2 ? coordinates[2].y : side === "long" ? entryY + 40 : entryY - 40;

  const boxLeft = Math.min(startX, endX);
  const boxWidth = Math.abs(startX - endX);

  const entryPrice = overlay.points[0].value!;
  const targetPrice = overlay.points[1].value!;
  const stopPrice = overlay.points[2]?.value ?? yAxis.convertFromPixel(stopY);

  const precision = chart.getSymbol?.()?.pricePrecision ?? 2;
  const selected = isOverlaySelected(chart, overlay.id);
  const complete = isOverlayComplete(overlay);
  const showLabels = selected || !complete;

  const reward = side === "long" ? targetPrice - entryPrice : entryPrice - targetPrice;
  const risk = side === "long" ? entryPrice - stopPrice : stopPrice - entryPrice;
  const rr = risk > 0 ? (reward / risk).toFixed(2) : "0.00";
  const profitPercent = (reward / entryPrice * 100).toFixed(2);
  const lossPercent = (risk / entryPrice * 100).toFixed(2);

  figures.push({
    type: "rect",
    attrs: {
      x: boxLeft,
      y: Math.min(entryY, targetY),
      width: boxWidth,
      height: Math.abs(entryY - targetY),
    },
    styles: { color: "rgba(38, 166, 154, 0.2)", style: "fill" },
  });

  figures.push({
    type: "rect",
    attrs: {
      x: boxLeft,
      y: Math.min(entryY, stopY),
      width: boxWidth,
      height: Math.abs(entryY - stopY),
    },
    styles: { color: "rgba(239, 83, 80, 0.2)", style: "fill" },
  });

  if (showLabels) {
    figures.push({
      type: "text",
      attrs: {
        x: endX,
        y: targetY,
        text: `Target: ${formatPrice(targetPrice, precision)} (${profitPercent}%)`,
        align: "left",
        baseline: side === "long" ? "bottom" : "top",
      },
      styles: {
        color: "#26a69a",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingLeft: 4,
        paddingRight: 4,
      },
    });

    figures.push({
      type: "text",
      attrs: {
        x: endX,
        y: stopY,
        text: `Stop: ${formatPrice(stopPrice, precision)} (${lossPercent}%)`,
        align: "left",
        baseline: side === "long" ? "top" : "bottom",
      },
      styles: {
        color: "#ef5350",
        backgroundColor: "rgba(0,0,0,0.6)",
        paddingLeft: 4,
        paddingRight: 4,
      },
    });

    figures.push({
      type: "text",
      attrs: {
        x: boxLeft + boxWidth / 2,
        y: entryY,
        text: `R/R Ratio: ${rr}`,
        align: "center",
        baseline: "middle",
      },
      styles: {
        color: "#ffffff",
        backgroundColor: "rgba(0,0,0,0.8)",
        paddingLeft: 6,
        paddingRight: 6,
        borderRadius: 2,
      },
    });
  }

  return figures;
}

const BASE = {
  totalStep: 3,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: true,
} as const;

/** Long/short position overlays: green/red zones, labels only when selected. */
export const longPositionOverlay: OverlayTemplate = {
  ...BASE,
  name: "longPosition",
  createPointFigures: (params) => createPositionFigures("long", params as CreateParams),
};

export const shortPositionOverlay: OverlayTemplate = {
  ...BASE,
  name: "shortPosition",
  createPointFigures: (params) => createPositionFigures("short", params as CreateParams),
};

export function ensurePositionOverlaysRegistered(): void {
  registerOverlay(longPositionOverlay);
  registerOverlay(shortPositionOverlay);
}

export const POSITION_OVERLAY_NAMES = new Set(["longPosition", "shortPosition"]);

function usesCustomRenderer(overlay: { createPointFigures?: unknown }): boolean {
  const fn = overlay.createPointFigures?.toString?.() ?? "";
  return fn.includes("createPositionFigures");
}

/** Recreate legacy long/short overlays so they pick up the custom template. */
export function upgradePositionOverlays(chart: Chart): void {
  ensurePositionOverlaysRegistered();

  const overlays = chart.getOverlays?.() ?? [];
  for (const overlay of overlays) {
    if (!POSITION_OVERLAY_NAMES.has(overlay.name) || usesCustomRenderer(overlay)) continue;

    chart.removeOverlay({ id: overlay.id });
    chart.createOverlay({
      name: overlay.name,
      groupId: overlay.groupId,
      paneId: overlay.paneId,
      lock: overlay.lock,
      visible: overlay.visible,
      mode: overlay.mode,
      points: overlay.points,
      styles: overlay.styles,
      extendData: overlay.extendData,
    });
  }
}
