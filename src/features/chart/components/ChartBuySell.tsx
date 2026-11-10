import { useState, useCallback } from "react";
import { useOrderLines, useKlinechartsUI } from "@/core/headless";
import { useLivePrice } from "@/features/chart/hooks/use-live-price";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import {
  ChartJournalTradeDialog,
  type ChartJournalTradeDraft,
} from "@/features/chart/components/ChartJournalTradeDialog";
import { cn, formatPrice } from "@/lib/utils";
import {
  ChevronUp,
  ChevronDown,
  X,
  Target,
  ShieldAlert,
  BookPlus,
} from "lucide-react";

interface TradeInputs {
  lots: string;
  sl: string;
  tp: string;
}

function calcRR(
  entry: number | null,
  sl: string,
  tp: string,
): { rr: number | null; slPips: number | null; tpPips: number | null } {
  if (!entry) return { rr: null, slPips: null, tpPips: null };
  const slVal = parseFloat(sl);
  const tpVal = parseFloat(tp);
  const slPips = Number.isFinite(slVal) ? Math.abs(entry - slVal) : null;
  const tpPips = Number.isFinite(tpVal) ? Math.abs(tpVal - entry) : null;
  const rr =
    slPips && tpPips && slPips > 0 ? tpPips / slPips : null;
  return { rr, slPips, tpPips };
}

/**
 * Floating Trade Panel (top-right of the chart, when Trade Mode is active).
 * Shows Sell/Buy with collapsible Lot, SL, TP inputs and auto-calculated R/R.
 */
export function ChartBuySell() {
  const { t } = useChartT();
  const { state } = useKlinechartsUI();
  const { last } = useLivePrice();
  const { createOrderLine, removeOrderLine } = useOrderLines();
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState<TradeInputs>({ lots: "0.01", sl: "", tp: "" });
  const [activeLines, setActiveLines] = useState<string[]>([]);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalDraft, setJournalDraft] = useState<ChartJournalTradeDraft | null>(null);
  const [lastSide, setLastSide] = useState<"buy" | "sell">("buy");

  const setField = (field: keyof TradeInputs, value: string) =>
    setInputs((prev) => ({ ...prev, [field]: value }));

  const removeAllActive = useCallback(() => {
    activeLines.forEach((id) => removeOrderLine(id));
    setActiveLines([]);
  }, [activeLines, removeOrderLine]);

  const place = (side: "long" | "short") => {
    if (last == null) return;
    setLastSide(side === "long" ? "buy" : "sell");
    const newIds: string[] = [];

    const entryId = createOrderLine({
      price: last,
      draggable: false,
      color: side === "long" ? "#26a69a" : "#ef5350",
      text: `${side === "long" ? t("trade.buy") : t("trade.sell")} @ ${formatPrice(last)}`,
      line: { width: 2, style: "solid" },
    });
    if (entryId) newIds.push(entryId);

    const slVal = parseFloat(inputs.sl);
    if (Number.isFinite(slVal)) {
      const slId = createOrderLine({
        price: slVal,
        draggable: true,
        color: "#ef5350",
        text: `SL @ ${formatPrice(slVal)}`,
        line: { width: 1, style: "dashed" },
      });
      if (slId) newIds.push(slId);
    }

    const tpVal = parseFloat(inputs.tp);
    if (Number.isFinite(tpVal)) {
      const tpId = createOrderLine({
        price: tpVal,
        draggable: true,
        color: "#26a69a",
        text: `TP @ ${formatPrice(tpVal)}`,
        line: { width: 1, style: "dashed" },
      });
      if (tpId) newIds.push(tpId);
    }

    setActiveLines((prev) => [...prev, ...newIds]);
  };

  const openJournal = () => {
    if (last == null || !state.symbol?.ticker) return;
    const slVal = parseFloat(inputs.sl);
    const tpVal = parseFloat(inputs.tp);
    const lots = parseFloat(inputs.lots);

    setJournalDraft({
      symbol: state.symbol.ticker,
      type: lastSide,
      volume: Number.isFinite(lots) && lots > 0 ? lots : 0.01,
      entryPrice: last,
      stopLoss: Number.isFinite(slVal) ? slVal : undefined,
      takeProfit: Number.isFinite(tpVal) ? tpVal : undefined,
    });
    setJournalOpen(true);
  };

  const price = formatPrice(last);
  const { rr, slPips, tpPips } = calcRR(last, inputs.sl, inputs.tp);

  return (
    <>
      <div className="pointer-events-auto absolute right-2 top-2 z-20 flex flex-col items-end gap-1">
        <div className="flex items-stretch gap-px shadow-lg">
          <button
            onClick={() => place("short")}
            className={cn(
              "rounded-l-md flex cursor-pointer flex-col items-start px-3 py-1.5 text-start transition-all",
              "bg-background border border-bear/50 hover:bg-bear/15 hover:border-bear",
            )}
          >
            <span className="text-[10px] uppercase text-bear font-bold tracking-wider">
              {t("trade.sell")}
            </span>
            <span className="font-mono text-xs font-semibold tabular-nums text-bear">
              {price}
            </span>
          </button>

          <button
            onClick={() => setExpanded((v) => !v)}
            className={cn(
              "flex items-center px-1 border-y border-border bg-background cursor-pointer transition-colors hover:bg-accent",
            )}
            title={expanded ? t("trade.collapse") : t("trade.expand")}
          >
            {expanded ? (
              <ChevronUp className="size-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-3 text-muted-foreground" />
            )}
          </button>

          <button
            onClick={() => place("long")}
            className={cn(
              "rounded-r-md flex cursor-pointer flex-col items-end px-3 py-1.5 text-end transition-all",
              "bg-background border border-bull/50 hover:bg-bull/15 hover:border-bull",
            )}
          >
            <span className="text-[10px] uppercase text-bull font-bold tracking-wider">
              {t("trade.buy")}
            </span>
            <span className="font-mono text-xs font-semibold tabular-nums text-bull">
              {price}
            </span>
          </button>
        </div>

        {expanded && (
          <div className="flex w-64 flex-col gap-2 rounded-md border border-border bg-card p-3 shadow-xl text-xs">
            <label className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground font-medium">{t("trade.lotSize")}</span>
              <input
                type="number"
                value={inputs.lots}
                min={0.01}
                step={0.01}
                onChange={(e) => setField("lots", e.target.value)}
                className="w-24 rounded border border-border bg-background px-2 py-1 text-right font-mono tabular-nums focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </label>

            <label className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-bear font-medium">
                <ShieldAlert className="size-3" />
                SL
              </span>
              <input
                type="number"
                value={inputs.sl}
                step="any"
                placeholder={t("trade.slPrice")}
                onChange={(e) => setField("sl", e.target.value)}
                className="w-24 rounded border border-bear/40 bg-background px-2 py-1 text-right font-mono tabular-nums text-bear placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-bear"
              />
            </label>

            <label className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1 text-bull font-medium">
                <Target className="size-3" />
                TP
              </span>
              <input
                type="number"
                value={inputs.tp}
                step="any"
                placeholder={t("trade.tpPrice")}
                onChange={(e) => setField("tp", e.target.value)}
                className="w-24 rounded border border-bull/40 bg-background px-2 py-1 text-right font-mono tabular-nums text-bull placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-bull"
              />
            </label>

            {(slPips != null || tpPips != null || rr != null) && (
              <div className="mt-1 flex items-center justify-between rounded-sm bg-muted/50 px-2 py-1.5">
                {slPips != null && (
                  <span className="text-bear">
                    {t("trade.risk")}: <b>{formatPrice(slPips)}</b>
                  </span>
                )}
                {rr != null && (
                  <span
                    className={cn(
                      "font-semibold",
                      rr >= 2 ? "text-bull" : rr >= 1 ? "text-foreground" : "text-bear",
                    )}
                  >
                    {t("trade.rrRatio")} {rr.toFixed(2)}
                  </span>
                )}
                {tpPips != null && (
                  <span className="text-bull">
                    {t("trade.reward")}: <b>{formatPrice(tpPips)}</b>
                  </span>
                )}
              </div>
            )}

            {last != null && (
              <button
                type="button"
                onClick={openJournal}
                className="flex items-center justify-center gap-1 rounded border border-primary/40 bg-primary/5 px-2 py-1.5 font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <BookPlus className="size-3.5" />
                {t("trade.saveToJournal")}
              </button>
            )}

            {activeLines.length > 0 && (
              <button
                onClick={removeAllActive}
                className="mt-1 flex items-center justify-center gap-1 rounded border border-border px-2 py-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-3" />
                {t("trade.clearLines", { count: activeLines.length })}
              </button>
            )}
          </div>
        )}
      </div>

      <ChartJournalTradeDialog
        open={journalOpen}
        onOpenChange={setJournalOpen}
        draft={journalDraft}
      />
    </>
  );
}
