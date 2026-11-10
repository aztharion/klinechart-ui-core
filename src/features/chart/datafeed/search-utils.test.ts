import { describe, it, expect } from "vitest";
import { filterSymbolUniverse } from "./search-utils";
import type { PartialSymbolInfo } from "./types";

const POPULAR: PartialSymbolInfo[] = [{ ticker: "BTCUSDT", name: "Bitcoin / Tether" }];
const UNIVERSE: PartialSymbolInfo[] = [
  { ticker: "BTCUSDT", name: "Bitcoin / Tether" },
  { ticker: "ETHUSDT", name: "Ethereum / Tether" },
  { ticker: "BTC-USDT", name: "Bitcoin / Tether" },
];

describe("filterSymbolUniverse", () => {
  it("returns the full universe when search is empty", () => {
    expect(filterSymbolUniverse(UNIVERSE, "", POPULAR)).toEqual(UNIVERSE);
  });

  it("falls back to popular while universe is loading", () => {
    expect(filterSymbolUniverse([], "", POPULAR)).toEqual(POPULAR);
  });

  it("matches tickers across dash/underscore formats", () => {
    const results = filterSymbolUniverse(UNIVERSE, "btcusdt", POPULAR);
    expect(results.map((s) => s.ticker)).toEqual(["BTCUSDT", "BTC-USDT"]);
  });
});
