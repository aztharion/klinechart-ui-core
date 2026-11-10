import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useSymbolSearch } from "@/core/headless";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { datafeed } from "@/features/chart/datafeed";
import { SYMBOL_BROWSE_PAGE_SIZE } from "@/features/chart/datafeed/search-utils";
import type { PartialSymbolInfo } from "@/features/chart/datafeed";
import {
  AllSourcesIcon,
  CoinIcon,
  ExchangeBadge,
  ExchangeIcon,
} from "@/lib/market-icons";
import { cn } from "@/lib/utils";
import { isSameChartSymbol } from "@/features/chart/utils/chart-symbol-url";

interface SymbolSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SymbolRowProps {
  sym: PartialSymbolInfo;
  isActive: boolean;
  onSelect: (sym: PartialSymbolInfo) => void;
}

const SymbolRow = memo(function SymbolRow({ sym, isActive, onSelect }: SymbolRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(sym)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-start transition-colors hover:bg-accent",
          isActive && "bg-primary/10",
        )}
      >
        <CoinIcon ticker={sym.ticker} className="size-8" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">{sym.ticker}</div>
          {typeof sym.name === "string" && (
            <div className="truncate text-xs text-muted-foreground">{sym.name}</div>
          )}
        </div>
        <ExchangeBadge
          sourceId={String(sym.source ?? "")}
          label={String(sym.exchange ?? sym.source ?? "")}
        />
      </button>
    </li>
  );
});

export function SymbolSearchDialog({ open, onOpenChange }: SymbolSearchDialogProps) {
  const { t } = useChartT();
  const { query, activeSymbol, setQuery, selectSymbol } = useSymbolSearch(250);
  const [scope, setScope] = useState<string | null>(() =>
    datafeed.getSearchScope(),
  );
  const [items, setItems] = useState<PartialSymbolInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [complete, setComplete] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const fetchGen = useRef(0);
  const sources = datafeed.list();

  const trimmedQuery = query.trim();

  const fetchPage = useCallback(
    async (offset: number, replace: boolean) => {
      const gen = ++fetchGen.current;
      if (replace) setLoading(true);
      else setLoadingMore(true);

      try {
        const page = await datafeed.searchSymbolsPage(
          trimmedQuery,
          offset,
          SYMBOL_BROWSE_PAGE_SIZE,
        );
        if (gen !== fetchGen.current) return;

        setTotal(page.total);
        setComplete(page.complete);
        setHasMore(page.hasMore);
        setItems((prev) => (replace ? page.items : [...prev, ...page.items]));
      } catch {
        if (gen !== fetchGen.current) return;
        if (replace) {
          setItems([]);
          setTotal(0);
          setComplete(true);
          setHasMore(false);
        }
      } finally {
        if (gen === fetchGen.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [trimmedQuery],
  );

  useEffect(() => {
    if (!open) return;
    fetchGen.current += 1;
    setItems([]);
    setTotal(0);
    setComplete(false);
    setHasMore(false);

    const timer = window.setTimeout(() => {
      void fetchPage(0, true);
    }, trimmedQuery ? 250 : 0);

    return () => window.clearTimeout(timer);
  }, [open, scope, trimmedQuery, fetchPage]);

  const applyScope = (id: string | null) => {
    setScope(id);
    datafeed.setSearchScope(id);
  };

  const handleSelect = useCallback(
    (sym: PartialSymbolInfo) => {
      selectSymbol(sym);
      onOpenChange(false);
    },
    [onOpenChange, selectSymbol],
  );

  const chip = (active: boolean) =>
    cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
      active
        ? "border-primary/40 bg-primary/15 text-primary"
        : "border-border text-muted-foreground hover:bg-accent",
    );

  const totalLabel = complete ? String(total) : `${total}+`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex h-[min(85vh,720px)] max-h-[85vh] w-full max-w-xl flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader className="shrink-0 border-b border-border px-4 py-3">
          <DialogTitle className="sr-only">{t("sy.title")}</DialogTitle>
          <div className="flex items-center gap-2">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("sy.searchPh")}
              className="h-8 border-0 px-0 shadow-none focus-visible:ring-0"
            />
            {loading && (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => applyScope(null)}
              className={chip(scope === null)}
            >
              <AllSourcesIcon className="size-4" />
              {t("sy.all")}
            </button>
            {sources.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => applyScope(s.id)}
                className={chip(scope === s.id)}
              >
                <ExchangeIcon sourceId={s.id} className="size-4" />
                {s.label}
              </button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="min-h-0 flex-1" viewportClassName="h-full px-2 pb-2">
          {items.length === 0 ? (
            <div className="flex min-h-full items-center justify-center px-3 py-10 text-center text-sm text-muted-foreground">
              {loading ? t("sy.searching") : t("sy.empty")}
            </div>
          ) : (
            <div className="py-1">
              <p className="px-3 pb-2 text-xs text-muted-foreground">
                {t("sy.showingCount", {
                  shown: items.length,
                  total: totalLabel,
                })}
              </p>
              <ul>
                {items.map((sym) => (
                  <SymbolRow
                    key={`${sym.source ?? ""}:${sym.ticker}`}
                    sym={sym}
                    isActive={isSameChartSymbol(activeSymbol, sym)}
                    onSelect={handleSelect}
                  />
                ))}
              </ul>
              {hasMore && (
                <div className="px-3 py-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled={loadingMore}
                    onClick={() => void fetchPage(items.length, false)}
                  >
                    {loadingMore ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      t("sy.loadMore")
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
