import { registerOverlay } from "klinecharts"
import type {
  OverlayFigure,
  OverlayCreateFiguresCallbackParams,
  Period,
} from "klinecharts"

export interface TradeSpan {
  id: string
  type: "buy" | "sell"
  symbol: string
  openTime: number // Milliseconds
  openPrice: number
  closeTime?: number // Milliseconds (undefined if still open)
  closePrice?: number
  pnl?: number
}

export type ChartTimeframe = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"

export interface TradeSpanExtendData {
  type: "buy" | "sell"
  openPrice: number
  closePrice?: number
  bullColor: string
  bearColor: string
}

let isTradeSpanOverlayRegistered = false

export function ensureTradeSpanOverlayRegistered(): void {
  if (isTradeSpanOverlayRegistered) return

  registerOverlay<TradeSpanExtendData>({
    name: "tradeSpan",
    totalStep: 2,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: (params: OverlayCreateFiguresCallbackParams<TradeSpanExtendData>) => {
      const { coordinates, overlay } = params
      const figures: OverlayFigure[] = []
      if (!coordinates || coordinates.length === 0) return figures

      const entryCoord = coordinates[0]
      const exitCoord = coordinates[1]
      const data = overlay.extendData || {
        type: "buy",
        openPrice: 0,
        bullColor: "#10B981",
        bearColor: "#EF4444",
      }
      const type = data.type
      const bullColor = data.bullColor
      const bearColor = data.bearColor
      const openPrice = data.openPrice
      const closePrice = data.closePrice

      // 1. Connecting trajectory dashed line (if exit exists)
      if (exitCoord && typeof exitCoord.x === "number" && typeof exitCoord.y === "number") {
        figures.push({
          type: "line",
          attrs: {
            coordinates: [
              { x: entryCoord.x, y: entryCoord.y },
              { x: exitCoord.x, y: exitCoord.y },
            ],
          },
          styles: {
            style: "dashed",
            dashedValue: [4, 4],
            color: "rgba(156, 163, 175, 0.5)",
            size: 1.5,
          },
        })

        // Exit marker
        figures.push({
          type: "circle",
          attrs: {
            x: exitCoord.x,
            y: exitCoord.y,
            r: 5,
          },
          styles: {
            style: "fill",
            color: type === "buy" ? bearColor : bullColor,
          },
        })

        if (closePrice != null) {
          figures.push({
            type: "text",
            attrs: {
              x: exitCoord.x,
              y: exitCoord.y - 12,
              text: `CLOSE @ ${closePrice}`,
              align: "center",
              baseline: "bottom",
            },
            styles: {
              color: "rgba(255, 255, 255, 0.9)",
              size: 11,
              family: "monospace",
            },
          })
        }
      }

      // 2. Entry marker
      if (type === "buy") {
        figures.push({
          type: "polygon",
          attrs: {
            coordinates: [
              { x: entryCoord.x, y: entryCoord.y },
              { x: entryCoord.x - 6, y: entryCoord.y + 12 },
              { x: entryCoord.x + 6, y: entryCoord.y + 12 },
            ],
          },
          styles: {
            style: "fill",
            color: bullColor,
          },
        })

        figures.push({
          type: "text",
          attrs: {
            x: entryCoord.x,
            y: entryCoord.y + 16,
            text: `BUY @ ${openPrice}`,
            align: "center",
            baseline: "top",
          },
          styles: {
            color: bullColor,
            size: 11,
            family: "monospace",
          },
        })
      } else {
        figures.push({
          type: "polygon",
          attrs: {
            coordinates: [
              { x: entryCoord.x, y: entryCoord.y },
              { x: entryCoord.x - 6, y: entryCoord.y - 12 },
              { x: entryCoord.x + 6, y: entryCoord.y - 12 },
            ],
          },
          styles: {
            style: "fill",
            color: bearColor,
          },
        })

        figures.push({
          type: "text",
          attrs: {
            x: entryCoord.x,
            y: entryCoord.y - 16,
            text: `SELL @ ${openPrice}`,
            align: "center",
            baseline: "bottom",
          },
          styles: {
            color: bearColor,
            size: 11,
            family: "monospace",
          },
        })
      }

      return figures
    },
  })

  isTradeSpanOverlayRegistered = true
}

export function resolveAutoTimeframe(
  activeTrade?: TradeSpan,
  forcedTimeframe?: ChartTimeframe
): ChartTimeframe {
  if (forcedTimeframe) return forcedTimeframe
  if (!activeTrade) return "15m"

  const durationMs = (activeTrade.closeTime ?? Date.now()) - activeTrade.openTime
  if (durationMs < 3_600_000) {
    // < 1 hour: Scalping resolution
    return durationMs < 900_000 ? "1m" : "5m"
  }
  if (durationMs <= 86_400_000) {
    // 1h – 24h: Day trading resolution
    return durationMs <= 14_400_000 ? "15m" : "1h"
  }
  // > 24h: Swing trading resolution
  return durationMs <= 604_800_000 ? "4h" : "1d"
}

export function timeframeToPeriod(timeframe: ChartTimeframe): Period {
  const match = timeframe.match(/^(\d+)([mhd])$/)
  if (!match) return { type: "minute", span: 15 }
  const span = parseInt(match[1], 10)
  const unit = match[2]
  switch (unit) {
    case "m":
      return { type: "minute", span }
    case "h":
      return { type: "hour", span }
    case "d":
      return { type: "day", span }
    default:
      return { type: "minute", span: 15 }
  }
}

export function estimateSpanSeconds(timeframe: ChartTimeframe, barCount = 300): number {
  switch (timeframe) {
    case "1m":
      return barCount * 60
    case "5m":
      return barCount * 300
    case "15m":
      return barCount * 900
    case "1h":
      return barCount * 3600
    case "4h":
      return barCount * 14400
    case "1d":
      return barCount * 86400
    default:
      return barCount * 900
  }
}
