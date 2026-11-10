import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useKlinechartsUI, useSymbolSearch } from "@/core/headless";
import { datafeed } from "@/features/chart/datafeed";
import type { RoutedSymbolInfo } from "@/features/chart/datafeed";

function resolveExchangeLabel(symbol: RoutedSymbolInfo | null | undefined): string {
  if (!symbol) return "";
  if (symbol.exchange) return String(symbol.exchange);
  const sourceId = symbol.source;
  if (!sourceId) return "";
  const src = datafeed.list().find((s) => s.id === sourceId);
  return src?.label ?? sourceId;
}

/** Browser tab title: Chart · TICKER · Exchange | AppName */
export function useChartDocumentTitle(appName: string = "KlineChart") {
  const { t } = useTranslation("common");
  const { state } = useKlinechartsUI();
  const { activeSymbol } = useSymbolSearch();

  const symbol =
    (state.symbol as RoutedSymbolInfo | null | undefined) ??
    (activeSymbol as RoutedSymbolInfo | undefined);
  const pageName = t("sidebar.menu.chart", "Chart");
  const ticker = symbol?.ticker ? String(symbol.ticker) : "";
  const exchange = resolveExchangeLabel(symbol);

  useEffect(() => {
    const parts = [pageName, ticker, exchange].filter(Boolean);
    document.title = parts.length
      ? `${parts.join(" · ")} | ${appName}`
      : appName;

    return () => {
      document.title = appName;
    };
  }, [pageName, ticker, exchange, appName]);
}
