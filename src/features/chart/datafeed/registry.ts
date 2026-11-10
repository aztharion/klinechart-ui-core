import type {
  Datafeed,
  DataSource,
  DepthSnapshot,
  KLineData,
  PartialSymbolInfo,
  RoutedSymbolInfo,
  SymbolInfo,
  SymbolSearchPage,
  TerminalPeriod,
} from "./types";

function paginateMergedSources(
  sources: PartialSymbolInfo[][],
  offset: number,
  limit: number,
): PartialSymbolInfo[] {
  const items: PartialSymbolInfo[] = [];
  let skip = offset;
  let remaining = limit;

  for (const list of sources) {
    if (remaining <= 0) break;
    if (skip >= list.length) {
      skip -= list.length;
      continue;
    }
    const chunk = list.slice(skip, skip + remaining);
    items.push(...chunk);
    remaining -= chunk.length;
    skip = 0;
  }

  return items;
}

/**
 * Aggregates several {@link DataSource}s behind one {@link Datafeed}.
 *
 * - `searchSymbols` fans out to every source in parallel and tags each result
 *   with its `source` id (and an `exchange` label for display).
 * - `searchSymbolsPage` loads sources lazily and returns slices for UI pagination.
 * - `getHistoryKLineData` / `subscribe` / `unsubscribe` route to the source
 *   that owns the symbol, read from the `source` tag (falling back to the
 *   first source for symbols that predate tagging, e.g. a default symbol).
 */
export class DatafeedRegistry implements Datafeed {
  private readonly sources: DataSource[];
  private readonly byId: Map<string, DataSource>;

  /** When set, `searchSymbols` queries only this source id. `null` = all. */
  private scope: string | null = null;

  /** Lazy merged indexes keyed by scope + query. */
  private searchIndexes = new Map<string, PartialSymbolInfo[][]>();

  constructor(sources: DataSource[]) {
    if (sources.length === 0) {
      throw new Error("DatafeedRegistry requires at least one source");
    }
    this.sources = sources;
    this.byId = new Map(sources.map((s) => [s.id, s]));
  }

  /** All registered sources, in priority order. */
  list(): readonly DataSource[] {
    return this.sources;
  }

  /** Restrict search to a single source, or pass `null` to search all. */
  setSearchScope(sourceId: string | null): void {
    if (this.scope !== sourceId) {
      this.searchIndexes.clear();
    }
    this.scope = sourceId && this.byId.has(sourceId) ? sourceId : null;
  }

  getSearchScope(): string | null {
    return this.scope;
  }

  private scopedSources(): DataSource[] {
    return this.scope
      ? this.sources.filter((s) => s.id === this.scope)
      : this.sources;
  }

  private indexKey(search: string): string {
    return `${this.scope ?? "all"}:${search.trim().toLowerCase()}`;
  }

  private resolve(symbol: SymbolInfo | PartialSymbolInfo): DataSource {
    const id = (symbol as RoutedSymbolInfo).source;
    return (id && this.byId.get(id)) || this.sources[0];
  }

  async searchSymbols(
    search: string,
    signal?: AbortSignal,
  ): Promise<PartialSymbolInfo[]> {
    const scoped = this.scopedSources();

    const settled = await Promise.allSettled(
      scoped.map((s) => s.searchSymbols(search, signal)),
    );

    const out: PartialSymbolInfo[] = [];
    settled.forEach((res, i) => {
      if (res.status !== "fulfilled") return;
      const src = scoped[i];
      for (const sym of res.value) {
        out.push({ ...sym, source: src.id, exchange: sym.exchange ?? src.label });
      }
    });
    return out;
  }

  /**
   * Returns the next page of symbols without loading the full merged list into
   * the caller. Sources are indexed lazily as the user pages deeper.
   */
  async searchSymbolsPage(
    search: string,
    offset: number,
    limit: number,
    signal?: AbortSignal,
  ): Promise<SymbolSearchPage> {
    const key = this.indexKey(search);
    let merged = this.searchIndexes.get(key);
    if (!merged) {
      merged = [];
      this.searchIndexes.set(key, merged);
    }

    const scoped = this.scopedSources();
    const neededEnd = offset + limit;
    let flatCount = merged.reduce((n, list) => n + list.length, 0);

    while (flatCount < neededEnd && merged.length < scoped.length) {
      const src = scoped[merged.length];
      const filtered = await src.listFilteredSymbols(search, signal);
      merged.push(
        filtered.map((sym) => ({
          ...sym,
          source: src.id,
          exchange: sym.exchange ?? src.label,
        })),
      );
      flatCount += merged[merged.length - 1].length;
    }

    const totalKnown = merged.reduce((n, list) => n + list.length, 0);
    const complete = merged.length === scoped.length;
    const items = paginateMergedSources(merged, offset, limit);
    const hasMore = complete
      ? offset + items.length < totalKnown
      : items.length === limit || merged.length < scoped.length;

    return {
      items,
      total: totalKnown,
      hasMore,
      complete,
    };
  }

  getHistoryKLineData(
    symbol: SymbolInfo,
    period: TerminalPeriod,
    from: number,
    to: number,
  ): Promise<KLineData[]> {
    return this.resolve(symbol).getHistoryKLineData(symbol, period, from, to);
  }

  subscribe(
    symbol: SymbolInfo,
    period: TerminalPeriod,
    callback: (data: KLineData) => void,
  ): void {
    this.resolve(symbol).subscribe(symbol, period, callback);
  }

  unsubscribe(symbol: SymbolInfo, period: TerminalPeriod): void {
    this.resolve(symbol).unsubscribe(symbol, period);
  }

  /** Whether the source owning `symbol` can stream an order book. */
  supportsDepth(symbol: SymbolInfo | PartialSymbolInfo): boolean {
    return typeof this.resolve(symbol).subscribeDepth === "function";
  }

  /**
   * Subscribe to the order book for `symbol` via its owning source.
   * Returns an unsubscribe function (a no-op if the source has no depth feed).
   */
  subscribeDepth(
    symbol: SymbolInfo | PartialSymbolInfo,
    callback: (depth: DepthSnapshot) => void,
  ): () => void {
    const source = this.resolve(symbol);
    return source.subscribeDepth?.(symbol as SymbolInfo, callback) ?? (() => {});
  }
}

export function createDatafeed(sources: DataSource[]): DatafeedRegistry {
  return new DatafeedRegistry(sources);
}
