import { useState, useCallback, useEffect, useRef } from "react";
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
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BookPlus,
} from "lucide-react";

interface RRState {
  side: "long" | "short";
  entry: string;
  sl: string;
  tp: string;
  lineIds: string[];
}

function calcRR(entry: number, sl: number, tp: number) {
  const risk = Math.abs(entry - sl);
  const reward = Math.abs(tp - entry);
  const rr = risk > 0 ? reward / risk : null;
  return { risk, reward, rr };
}

function RRBadge({ rr }: { rr: number | null }) {
  if (rr == null) return null;
  const color =
    rr >= 3 ? "text-emerald-400 bg-emerald-400/10" :
    rr >= 2 ? "text-bull bg-bull/10" :
    rr >= 1 ? "text-yellow-400 bg-yellow-400/10" :
    "text-bear bg-bear/10";
  return (
    <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums", color)}>
      {rr.toFixed(2)}R
    </span>
  );
}

function StatRow({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2">
      <span className="shrink-0">{label}</span>
      <span
        className={cn(
          "min-w-0 truncate text-right font-mono text-[11px] font-semibold tabular-nums",
          valueClassName,
        )}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * Risk/Reward Tool — lets traders define Entry, SL, TP visually with order lines
 * and see instant R:R feedback. Lives as a floating panel on the chart.
 */
export function ChartRRTool() {
  const { t } = useChartT();
  const { state: uiState } = useKlinechartsUI();
  const ticker = uiState.symbol?.ticker;
  const precision = uiState.symbol?.pricePrecision ?? 2;
  const { last } = useLivePrice();
  const { createOrderLine, removeOrderLine } = useOrderLines();
  const [open, setOpen] = useState(true);
  const [journalOpen, setJournalOpen] = useState(false);
  const [journalDraft, setJournalDraft] = useState<ChartJournalTradeDraft | null>(null);
  const [rrState, setRRState] = useState<RRState>({
    side: "long",
    entry: "",
    sl: "",
    tp: "",
    lineIds: [],
  });
  const entrySeededRef = useRef(false);

  const formatLivePrice = useCallback(
    (price: number) => price.toFixed(precision),
    [precision],
  );

  // Reset panel when symbol changes.
  useEffect(() => {
    entrySeededRef.current = false;
    setRRState((prev) => {
      prev.lineIds.forEach((id) => removeOrderLine(id));
      return { side: "long", entry: "", sl: "", tp: "", lineIds: [] };
    });
  }, [ticker, removeOrderLine]);

  // Default entry to the current symbol price when the tool opens.
  useEffect(() => {
    if (last == null || entrySeededRef.current) return;
    setRRState((s) => ({ ...s, entry: formatLivePrice(last) }));
    entrySeededRef.current = true;
  }, [last, formatLivePrice, ticker]);

  const syncEntry = () => {
    if (last != null) {
      setRRState((s) => ({ ...s, entry: formatLivePrice(last) }));
      entrySeededRef.current = true;
    }
  };

  const clearLines = useCallback(() => {
    rrState.lineIds.forEach((id) => removeOrderLine(id));
    setRRState((s) => ({ ...s, lineIds: [] }));
  }, [rrState.lineIds, removeOrderLine]);

  const drawLines = () => {
    clearLines();
    const entryVal = parseFloat(rrState.entry);
    const slVal = parseFloat(rrState.sl);
    const tpVal = parseFloat(rrState.tp);
    const newIds: string[] = [];

    if (Number.isFinite(entryVal)) {
      const id = createOrderLine({
        price: entryVal,
        draggable: true,
        color: rrState.side === "long" ? "#26a69a" : "#ef5350",
        text: `Entry @ ${formatPrice(entryVal, precision)}`,
        line: { width: 2, style: "solid" },
        onPriceChange: (p) =>
          setRRState((s) => ({ ...s, entry: p.toFixed(precision) })),
      });
      if (id) newIds.push(id);
    }

    if (Number.isFinite(slVal)) {
      const id = createOrderLine({
        price: slVal,
        draggable: true,
        color: "#ef5350",
        text: `SL @ ${formatPrice(slVal, precision)}`,
        line: { width: 1, style: "dashed" },
        onPriceChange: (p) =>
          setRRState((s) => ({ ...s, sl: p.toFixed(precision) })),
      });
      if (id) newIds.push(id);
    }

    if (Number.isFinite(tpVal)) {
      const id = createOrderLine({
        price: tpVal,
        draggable: true,
        color: "#26a69a",
        text: `TP @ ${formatPrice(tpVal, precision)}`,
        line: { width: 1, style: "dashed" },
        onPriceChange: (p) =>
          setRRState((s) => ({ ...s, tp: p.toFixed(precision) })),
      });
      if (id) newIds.push(id);
    }

    setRRState((s) => ({ ...s, lineIds: newIds }));
  };

  const entryVal = parseFloat(rrState.entry);
  const slVal = parseFloat(rrState.sl);
  const tpVal = parseFloat(rrState.tp);

  const stats =
    Number.isFinite(entryVal) && Number.isFinite(slVal) && Number.isFinite(tpVal)
      ? calcRR(entryVal, slVal, tpVal)
      : null;

  const openJournal = () => {
    if (!ticker || !Number.isFinite(entryVal)) return;
    setJournalDraft({
      symbol: ticker,
      type: rrState.side === "long" ? "buy" : "sell",
      volume: 0.01,
      entryPrice: entryVal,
      stopLoss: Number.isFinite(slVal) ? slVal : undefined,
      takeProfit: Number.isFinite(tpVal) ? tpVal : undefined,
    });
    setJournalOpen(true);
  };

  const inputClass =
    "min-w-0 w-full rounded border bg-background px-2 py-1 text-right font-mono text-[11px] tabular-nums focus:outline-none focus:ring-1";

  return (
    <>
    <div className="pointer-events-auto absolute left-2 top-2 z-20 w-[17.5rem] max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-card text-xs shadow-xl">
      {/* Header */}
      <div className="flex min-w-0 items-center justify-between gap-2 rounded-t-lg border-b border-border bg-muted/30 px-2.5 py-1.5">
        <span className="truncate font-semibold text-foreground">{t("trade.rrTool")}</span>
        <div className="flex shrink-0 items-center gap-1">
          {stats?.rr != null && <RRBadge rr={stats.rr} />}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="flex flex-col gap-2 p-2.5">
          {/* Side toggle */}
          <div className="flex overflow-hidden rounded-md border border-border">
            <button
              type="button"
              onClick={() => setRRState((s) => ({ ...s, side: "long" }))}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors",
                rrState.side === "long"
                  ? "bg-bull/20 text-bull"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              <TrendingUp className="size-3 shrink-0" /> {t("common.long")}
            </button>
            <button
              type="button"
              onClick={() => setRRState((s) => ({ ...s, side: "short" }))}
              className={cn(
                "flex flex-1 items-center justify-center gap-1 py-1 text-[11px] font-semibold transition-colors",
                rrState.side === "short"
                  ? "bg-bear/20 text-bear"
                  : "text-muted-foreground hover:bg-accent",
              )}
            >
              <TrendingDown className="size-3 shrink-0" /> {t("common.short")}
            </button>
          </div>

          {/* Entry */}
          <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center gap-x-2">
            <span className="shrink-0 text-muted-foreground">{t("trade.entry")}</span>
            <input
              type="number"
              value={rrState.entry}
              step="any"
              placeholder="—"
              onChange={(e) => setRRState((s) => ({ ...s, entry: e.target.value }))}
              className={cn(inputClass, "border-border focus:ring-primary")}
            />
            <button
              type="button"
              onClick={syncEntry}
              title={t("trade.useLivePrice")}
              className="shrink-0 rounded border border-border p-1 text-muted-foreground hover:bg-accent"
            >
              <RefreshCw className="size-2.5" />
            </button>
          </div>

          {/* SL */}
          <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-2">
            <span className="flex shrink-0 items-center gap-0.5 text-bear">
              <ShieldAlert className="size-3 shrink-0" /> SL
            </span>
            <input
              type="number"
              value={rrState.sl}
              step="any"
              placeholder={t("trade.slPrice")}
              onChange={(e) => setRRState((s) => ({ ...s, sl: e.target.value }))}
              className={cn(
                inputClass,
                "border-bear/40 text-bear placeholder:text-muted-foreground/40 focus:ring-bear",
              )}
            />
          </div>

          {/* TP */}
          <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-2">
            <span className="flex shrink-0 items-center gap-0.5 text-bull">
              <Target className="size-3 shrink-0" /> TP
            </span>
            <input
              type="number"
              value={rrState.tp}
              step="any"
              placeholder={t("trade.tpPrice")}
              onChange={(e) => setRRState((s) => ({ ...s, tp: e.target.value }))}
              className={cn(
                inputClass,
                "border-bull/40 text-bull placeholder:text-muted-foreground/40 focus:ring-bull",
              )}
            />
          </div>

          {/* Stats row */}
          {stats && (
            <div className="space-y-1 rounded bg-muted/40 px-2 py-1.5">
              <StatRow
                label={t("trade.risk")}
                value={formatPrice(stats.risk, precision)}
                valueClassName="text-bear"
              />
              <StatRow
                label={t("trade.reward")}
                value={formatPrice(stats.reward, precision)}
                valueClassName="text-bull"
              />
              <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 border-t border-border pt-1">
                <span className="shrink-0 font-medium">{t("trade.rrRatio")}</span>
                <div className="flex min-w-0 justify-end">
                  <RRBadge rr={stats.rr} />
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-1 flex min-w-0 flex-col gap-1">
            <button
              type="button"
              onClick={drawLines}
              className="min-w-0 flex-1 truncate rounded bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t("trade.drawOnChart")}
            </button>
            {Number.isFinite(entryVal) && (
              <button
                type="button"
                onClick={openJournal}
                className="flex items-center justify-center gap-1 rounded border border-primary/40 bg-primary/5 px-2 py-1.5 font-medium text-primary transition-colors hover:bg-primary/10"
              >
                <BookPlus className="size-3.5" />
                {t("trade.saveToJournal")}
              </button>
            )}
            {rrState.lineIds.length > 0 && (
              <button
                type="button"
                onClick={clearLines}
                className="shrink-0 rounded border border-border px-2 py-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                title={t("trade.removeLines")}
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
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
