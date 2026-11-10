import type { PartialSymbolInfo } from "./types";

/** Max matches returned when the user is actively searching. */
export const SEARCH_MATCH_LIMIT = 100;

/** Initial / incremental page size for symbol browse UI. */
export const SYMBOL_BROWSE_PAGE_SIZE = 20;

export function precisionFromStep(step: string): number {
  const s = parseFloat(step).toString();
  const dot = s.indexOf(".");
  return dot === -1 ? 0 : s.length - dot - 1;
}

function normalizeSymbolToken(value: string): string {
  return value.replace(/[-_/ ]/g, "").toUpperCase();
}

/** Empty query returns the full cached universe (or `popular` while loading). */
export function filterSymbolUniverse(
  universe: PartialSymbolInfo[],
  search: string,
  popular: PartialSymbolInfo[],
): PartialSymbolInfo[] {
  const q = search.trim();
  if (!q) return universe.length > 0 ? universe : popular;

  const needle = normalizeSymbolToken(q);
  return universe
    .filter((s) => {
      const ticker = normalizeSymbolToken(s.ticker);
      const name =
        typeof s.name === "string" ? normalizeSymbolToken(s.name) : "";
      return ticker.includes(needle) || name.includes(needle);
    })
    .slice(0, SEARCH_MATCH_LIMIT);
}
