import type { Datafeed, PartialSymbolInfo, TerminalPeriod } from "@/core/headless";
import type { KLineData, SymbolInfo } from "@/core/klinechart";

export type { Datafeed, PartialSymbolInfo, TerminalPeriod, KLineData, SymbolInfo };

/**
 * A pluggable market-data source. Multiple sources are aggregated by the
 * registry into a single {@link Datafeed} that the terminal consumes.
 *
 * Each source owns a namespace of symbols. The registry tags every symbol it
 * returns with `source` so that history/subscription calls can be routed back
 * to the originating source.
 */
/** A single order-book level: `[price, size]`. */
export type DepthLevel = [number, number];

/** Top-of-book snapshot, bids sorted desc and asks sorted asc by price. */
export interface DepthSnapshot {
  bids: DepthLevel[];
  asks: DepthLevel[];
}

export interface DataSource {
  /** Stable id, also used to tag symbols (e.g. "binance"). */
  readonly id: string;
  /** Human-readable label shown in the UI. */
  readonly label: string;
  /** Full filtered symbol list for this source (cached internally). */
  listFilteredSymbols(search: string, signal?: AbortSignal): Promise<PartialSymbolInfo[]>;
  searchSymbols(search: string, signal?: AbortSignal): Promise<PartialSymbolInfo[]>;
  getHistoryKLineData(
    symbol: SymbolInfo,
    period: TerminalPeriod,
    from: number,
    to: number,
  ): Promise<KLineData[]>;
  subscribe(
    symbol: SymbolInfo,
    period: TerminalPeriod,
    callback: (data: KLineData) => void,
  ): void;
  unsubscribe(symbol: SymbolInfo, period: TerminalPeriod): void;
  /**
   * Optional live order-book subscription. Returns an unsubscribe function.
   * Sources that don't implement it are reported as unsupported by the
   * registry and the UI shows a placeholder.
   */
  subscribeDepth?(
    symbol: SymbolInfo,
    callback: (depth: DepthSnapshot) => void,
  ): () => void;
}

/** Symbol info carrying its owning source id (added by the registry). */
export interface RoutedSymbolInfo extends SymbolInfo {
  source?: string;
}

export interface SymbolSearchPage {
  items: PartialSymbolInfo[];
  total: number;
  hasMore: boolean;
  /** False until every scoped source has been indexed (total may grow). */
  complete: boolean;
}
