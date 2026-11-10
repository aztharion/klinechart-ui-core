import { useEffect, useRef, useState } from "react";
import { useKlinechartsUI, useSymbolSearch, useWatchlist } from "@/core/headless";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import type { WatchlistItem } from "@/core/headless";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExchangeBadge } from "@/lib/market-icons";
import { loadPersisted, savePersisted } from "@/features/chart/hooks/use-persistent-state";
import {
  type ChartWatchlistEntry,
  isSameChartSymbol,
  migrateWatchlistEntries,
  watchlistEntryKey,
} from "@/features/chart/utils/chart-symbol-url";
import type { RoutedSymbolInfo } from "@/features/chart/datafeed";
import { cn, formatPrice, formatPercent } from "@/lib/utils";

const DEFAULT_LIST: ChartWatchlistEntry[] = [
  { source: "binance", ticker: "BTCUSDT" },
  { source: "binance", ticker: "ETHUSDT" },
  { source: "binance", ticker: "SOLUSDT" },
  { source: "binance", ticker: "BNBUSDT" },
  { source: "binance", ticker: "XRPUSDT" },
];

function WatchRow({
  t,
  entry,
  item,
  active,
  onSelect,
  onRemove,
}: {
  t: (k: string, p?: Record<string, string | number>) => string;
  entry: ChartWatchlistEntry;
  item: WatchlistItem | undefined;
  active: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const up = (item?.changePercent ?? 0) >= 0;
  const [flash, setFlash] = useState<"up" | "down" | "">("");
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (item?.lastPrice == null) return;
    if (prev.current != null && item.lastPrice !== prev.current) {
      setFlash(item.lastPrice > prev.current ? "up" : "down");
      const timer = setTimeout(() => setFlash(""), 450);
      prev.current = item.lastPrice;
      return () => clearTimeout(timer);
    }
    prev.current = item.lastPrice;
  }, [item?.lastPrice]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={cn(
        "group flex cursor-pointer items-center justify-between gap-2 px-3 py-1.5 transition-colors hover:bg-accent",
        active && "bg-primary/10",
        flash === "up" && "flash-up",
        flash === "down" && "flash-down",
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium">{entry.ticker}</span>
        <ExchangeBadge sourceId={entry.source} label={entry.source} />
      </div>
      <div className="flex items-center gap-2 text-end tabular-nums">
        <span className="text-xs">{formatPrice(item?.lastPrice)}</span>
        <span className={cn("w-16 text-xs", up ? "text-bull" : "text-bear")}>
          {formatPercent(item?.changePercent)}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
          aria-label={t("wl.remove", { ticker: entry.ticker })}
        >
          <X className="size-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </div>
  );
}

function loadWatchlistEntries(): ChartWatchlistEntry[] {
  const v2 = loadPersisted<ChartWatchlistEntry[] | null>("watchlist.v2", null);
  if (v2?.length) return v2;

  const legacy = migrateWatchlistEntries(
    loadPersisted<unknown>("watchlist", DEFAULT_LIST),
  );
  return legacy.length > 0 ? legacy : DEFAULT_LIST;
}

export function WatchlistPanel() {
  const { t } = useChartT();
  const { state } = useKlinechartsUI();
  const { selectSymbol } = useSymbolSearch();
  const { items, addSymbol, removeSymbol } = useWatchlist();
  const [entries, setEntries] = useState<ChartWatchlistEntry[]>(loadWatchlistEntries);
  const [ticker, setTicker] = useState("");
  const seeded = useRef(false);
  const activeSymbol = state.symbol as RoutedSymbolInfo | null;

  useEffect(() => {
    if (seeded.current) return;
    entries.forEach((entry) => addSymbol(entry.ticker));
    seeded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!seeded.current) return;
    savePersisted("watchlist.v2", entries);
  }, [entries]);

  const addEntry = (entry: ChartWatchlistEntry) => {
    setEntries((prev) => {
      const key = watchlistEntryKey(entry);
      if (prev.some((e) => watchlistEntryKey(e) === key)) return prev;
      addSymbol(entry.ticker);
      return [...prev, entry];
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const tk = ticker.trim().toUpperCase();
    if (!tk) return;
    addEntry({
      source: String(activeSymbol?.source ?? "binance").toLowerCase(),
      ticker: tk,
    });
    setTicker("");
  };

  return (
    <aside className="flex h-full w-full flex-col bg-card">
      <div className="flex h-9 shrink-0 items-center border-b border-border px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {t("wl.title")}
      </div>

      <form onSubmit={submit} className="flex gap-1 border-b border-border p-2">
        <Input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder={t("wl.addPh")}
          className="h-7 text-xs"
        />
        <Button type="submit" size="icon-sm" variant="secondary">
          <Plus className="size-4" />
        </Button>
      </form>

      <ScrollArea className="min-h-0 flex-1">
        <ul className="py-1">
          {entries.map((entry) => {
            const item = items.find((i) => i.ticker === entry.ticker);
            return (
              <li key={watchlistEntryKey(entry)}>
                <WatchRow
                  t={t}
                  entry={entry}
                  item={item}
                  active={isSameChartSymbol(activeSymbol, entry)}
                  onSelect={() =>
                    selectSymbol({ ticker: entry.ticker, source: entry.source })
                  }
                  onRemove={() => {
                    setEntries((prev) =>
                      prev.filter((e) => watchlistEntryKey(e) !== watchlistEntryKey(entry)),
                    );
                    removeSymbol(entry.ticker);
                  }}
                />
              </li>
            );
          })}
        </ul>
      </ScrollArea>
    </aside>
  );
}
