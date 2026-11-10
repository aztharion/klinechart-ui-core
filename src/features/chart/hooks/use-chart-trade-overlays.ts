import { useEffect, useRef } from "react";
import { useOrderLines, useKlinechartsUI } from "@/core/headless";
import { formatPrice } from "@/lib/utils";

export interface TradeOverlayItem {
  id?: string;
  type: "buy" | "sell";
  entry_price: number;
  stop_loss?: number | null;
  take_profit?: number | null;
  closed_at?: string | null;
  symbol?: string;
}

/**
 * Renders order lines for open trades on the current chart symbol.
 */
export function useChartTradeOverlays(enabled: boolean, trades: TradeOverlayItem[] = []) {
  const { state } = useKlinechartsUI();
  const { createOrderLine, removeOrderLine } = useOrderLines();
  const lineIdsRef = useRef<string[]>([]);

  const ticker = state.symbol?.ticker?.toUpperCase() ?? "";

  useEffect(() => {
    if (!enabled || trades.length === 0) {
      lineIdsRef.current.forEach((id) => removeOrderLine(id));
      lineIdsRef.current = [];
      return;
    }

    const openTrades = trades.filter(
      (trade) => !trade.closed_at && (!trade.symbol || trade.symbol.toUpperCase() === ticker),
    );
    const newIds: string[] = [];

    for (const trade of openTrades) {
      const sideColor = trade.type === "buy" ? "#26a69a" : "#ef5350";
      const entryId = createOrderLine({
        price: trade.entry_price,
        draggable: false,
        color: sideColor,
        text: `${trade.type.toUpperCase()} @ ${formatPrice(trade.entry_price)}`,
        line: { width: 1, style: "solid" },
      });
      if (entryId) newIds.push(entryId);

      if (trade.stop_loss != null && trade.stop_loss > 0) {
        const slId = createOrderLine({
          price: trade.stop_loss,
          draggable: false,
          color: "#ef5350",
          text: `SL @ ${formatPrice(trade.stop_loss)}`,
          line: { width: 1, style: "dashed" },
        });
        if (slId) newIds.push(slId);
      }

      if (trade.take_profit != null && trade.take_profit > 0) {
        const tpId = createOrderLine({
          price: trade.take_profit,
          draggable: false,
          color: "#26a69a",
          text: `TP @ ${formatPrice(trade.take_profit)}`,
          line: { width: 1, style: "dashed" },
        });
        if (tpId) newIds.push(tpId);
      }
    }

    lineIdsRef.current.forEach((id) => removeOrderLine(id));
    lineIdsRef.current = newIds;

    return () => {
      newIds.forEach((id) => removeOrderLine(id));
    };
  }, [enabled, ticker, trades, createOrderLine, removeOrderLine]);
}
