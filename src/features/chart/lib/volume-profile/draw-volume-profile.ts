import type { OverlayFigure } from "@/core/klinechart";
import type { VolumeProfileConfig, VolumeProfileResult } from "./types";

export const VP_COLORS = {
  valueArea: "rgba(41, 98, 255, 0.85)",
  outsideArea: "rgba(120, 123, 134, 0.55)",
  up: "rgba(38, 166, 154, 0.85)",
  down: "rgba(239, 83, 80, 0.85)",
  poc: "#F23645",
  developingPoc: "rgba(242, 54, 69, 0.55)",
  vaLine: "rgba(41, 98, 255, 0.95)",
} as const;

/** Max horizontal extent of the histogram (~TradingView VPVR density). */
export const HISTOGRAM_WIDTH_RATIO = 0.15;
export const HISTOGRAM_INSET = 6;
/** Vertical gap between price rows so bins read as separate bars, not solid blocks. */
export const ROW_GAP_RATIO = 0.18;
export const ROW_GAP_MAX_PX = 2;

type YAxisLike = { convertToPixel: (value: number) => number };

function rowFill(
  row: VolumeProfileResult["rows"][number],
  config: VolumeProfileConfig,
  result: VolumeProfileResult,
): string {
  if (config.volumeMode === "updown") {
    return row.upVolume >= row.downVolume ? VP_COLORS.up : VP_COLORS.down;
  }
  const inValueArea = row.index >= result.valIndex && row.index <= result.vahIndex;
  return inValueArea ? VP_COLORS.valueArea : VP_COLORS.outsideArea;
}

function rowBarGeometry(
  row: VolumeProfileResult["rows"][number],
  result: VolumeProfileResult,
  yAxis: YAxisLike,
) {
  const yTop = yAxis.convertToPixel(row.priceHigh);
  const yBottom = yAxis.convertToPixel(row.priceLow);
  const barTop = Math.min(yTop, yBottom);
  const rawHeight = Math.max(1, Math.abs(yBottom - yTop));
  const rowGap = Math.min(ROW_GAP_MAX_PX, rawHeight * ROW_GAP_RATIO);
  const barHeight = Math.max(1, rawHeight - rowGap);
  const drawTop = barTop + rowGap / 2;
  const barWidth = Math.max(1, (row.totalVolume / result.maxVolume) * 0); // width set by caller
  return { drawTop, barHeight, barWidth };
}

export function drawHorizontalLine(
  ctx: CanvasRenderingContext2D,
  y: number,
  left: number,
  width: number,
  color: string,
  lineWidth = 1,
  dash: number[] = [],
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.setLineDash(dash);
  ctx.beginPath();
  ctx.moveTo(left, y);
  ctx.lineTo(left + width, y);
  ctx.stroke();
  ctx.restore();
}

export function drawVolumeProfileCanvas(
  ctx: CanvasRenderingContext2D,
  result: VolumeProfileResult,
  config: VolumeProfileConfig,
  bounding: { left: number; width: number },
  yAxis: YAxisLike,
  options?: { developingPocPrice?: number },
): void {
  const { left, width } = bounding;
  const maxBarWidth = width * HISTOGRAM_WIDTH_RATIO;
  const anchorRight = config.placement === "right";
  const edgeX = anchorRight ? left + width - HISTOGRAM_INSET : left + HISTOGRAM_INSET;

  for (const row of result.rows) {
    if (row.totalVolume <= 0) continue;

    const yTop = yAxis.convertToPixel(row.priceHigh);
    const yBottom = yAxis.convertToPixel(row.priceLow);
    const barTop = Math.min(yTop, yBottom);
    const rawHeight = Math.max(1, Math.abs(yBottom - yTop));
    const rowGap = Math.min(ROW_GAP_MAX_PX, rawHeight * ROW_GAP_RATIO);
    const barHeight = Math.max(1, rawHeight - rowGap);
    const drawTop = barTop + rowGap / 2;
    const barWidth = Math.max(1, (row.totalVolume / result.maxVolume) * maxBarWidth);
    const fill = rowFill(row, config, result);
    const x = anchorRight ? edgeX - barWidth : edgeX;

    ctx.fillStyle = fill;
    ctx.fillRect(x, drawTop, barWidth, barHeight);
  }

  const pocY = yAxis.convertToPixel(result.pocPrice);
  const vahY = yAxis.convertToPixel(result.vahPrice);
  const valY = yAxis.convertToPixel(result.valPrice);

  drawHorizontalLine(ctx, vahY, left, width, VP_COLORS.vaLine, 1, [4, 4]);
  drawHorizontalLine(ctx, valY, left, width, VP_COLORS.vaLine, 1, [4, 4]);
  drawHorizontalLine(ctx, pocY, left, width, VP_COLORS.poc, 1.5);

  if (options?.developingPocPrice != null) {
    const devY = yAxis.convertToPixel(options.developingPocPrice);
    if (Math.abs(devY - pocY) > 0.5) {
      drawHorizontalLine(ctx, devY, left, width, VP_COLORS.developingPoc, 1, [2, 3]);
    }
  }
}

/** Build overlay figures for FRVP inside a fixed horizontal range. */
export function buildVolumeProfileFigures(
  result: VolumeProfileResult,
  config: VolumeProfileConfig,
  xLeft: number,
  xRight: number,
  yAxis: YAxisLike,
): OverlayFigure[] {
  const figures: OverlayFigure[] = [];
  const left = Math.min(xLeft, xRight);
  const rangeWidth = Math.abs(xRight - xLeft);
  const maxBarWidth = rangeWidth * HISTOGRAM_WIDTH_RATIO;
  const anchorRight = config.placement === "right";
  const edgeX = anchorRight ? left + rangeWidth - HISTOGRAM_INSET : left + HISTOGRAM_INSET;

  for (const row of result.rows) {
    if (row.totalVolume <= 0) continue;

    const { drawTop, barHeight } = rowBarGeometry(row, result, yAxis);
    const barWidth = Math.max(1, (row.totalVolume / result.maxVolume) * maxBarWidth);
    const fill = rowFill(row, config, result);
    const x = anchorRight ? edgeX - barWidth : edgeX;

    figures.push({
      type: "rect",
      attrs: { x, y: drawTop, width: barWidth, height: barHeight },
      styles: { color: fill, style: "fill", borderSize: 0 },
      ignoreEvent: true,
    });
  }

  const right = left + rangeWidth;
  const lines: Array<{ price: number; color: string; width: number; dash: number[] }> = [
    { price: result.vahPrice, color: VP_COLORS.vaLine, width: 1, dash: [4, 4] },
    { price: result.valPrice, color: VP_COLORS.vaLine, width: 1, dash: [4, 4] },
    { price: result.pocPrice, color: VP_COLORS.poc, width: 1.5, dash: [] },
  ];

  for (const line of lines) {
    const y = yAxis.convertToPixel(line.price);
    figures.push({
      type: "line",
      attrs: {
        coordinates: [
          { x: left, y },
          { x: right, y },
        ],
      },
      styles: {
        color: line.color,
        size: line.width,
        style: line.dash.length ? "dashed" : "solid",
        dashedValue: line.dash.length ? line.dash : undefined,
      },
      ignoreEvent: true,
    });
  }

  return figures;
}
