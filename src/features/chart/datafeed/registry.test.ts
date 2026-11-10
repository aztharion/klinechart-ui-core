import { describe, it, expect, vi } from "vitest";
import { DatafeedRegistry } from "./registry";
import type { DataSource, KLineData } from "./types";

function makeSource(id: string, tickers: string[]): DataSource {
  const list = tickers.map((ticker) => ({ ticker }));
  return {
    id,
    label: id.toUpperCase(),
    async listFilteredSymbols() {
      return list;
    },
    async searchSymbols() {
      return list;
    },
    async getHistoryKLineData() {
      return [{ timestamp: 1, open: 1, high: 1, low: 1, close: 1 }] as KLineData[];
    },
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  };
}

describe("DatafeedRegistry", () => {
  it("tags search results with their source and label", async () => {
    const reg = new DatafeedRegistry([makeSource("a", ["X"]), makeSource("b", ["Y"])]);
    const res = await reg.searchSymbols("");
    expect(res).toEqual([
      { ticker: "X", source: "a", exchange: "A" },
      { ticker: "Y", source: "b", exchange: "B" },
    ]);
  });

  it("restricts search to a single source via scope", async () => {
    const reg = new DatafeedRegistry([makeSource("a", ["X"]), makeSource("b", ["Y"])]);
    reg.setSearchScope("b");
    const res = await reg.searchSymbols("");
    expect(res.map((r) => r.ticker)).toEqual(["Y"]);
    reg.setSearchScope(null);
    expect((await reg.searchSymbols("")).length).toBe(2);
  });

  it("routes subscribe to the source owning the symbol", () => {
    const a = makeSource("a", []);
    const b = makeSource("b", []);
    const reg = new DatafeedRegistry([a, b]);
    const period = { span: 1, type: "minute" as const, label: "1m" };
    reg.subscribe({ ticker: "Y", source: "b" } as never, period, () => {});
    expect(b.subscribe).toHaveBeenCalledOnce();
    expect(a.subscribe).not.toHaveBeenCalled();
  });

  it("falls back to the first source for untagged symbols", () => {
    const a = makeSource("a", []);
    const reg = new DatafeedRegistry([a, makeSource("b", [])]);
    const period = { span: 1, type: "minute" as const, label: "1m" };
    reg.unsubscribe({ ticker: "Z" } as never, period);
    expect(a.unsubscribe).toHaveBeenCalledOnce();
  });

  it("returns symbol pages lazily without loading all sources upfront", async () => {
    const reg = new DatafeedRegistry([
      makeSource("a", Array.from({ length: 25 }, (_, i) => `A${i}`)),
      makeSource("b", Array.from({ length: 10 }, (_, i) => `B${i}`)),
    ]);

    const page1 = await reg.searchSymbolsPage("", 0, 20);
    expect(page1.items).toHaveLength(20);
    expect(page1.items.every((s) => s.source === "a")).toBe(true);
    expect(page1.hasMore).toBe(true);

    const page2 = await reg.searchSymbolsPage("", 20, 20);
    expect(page2.items).toHaveLength(15);
    expect(page2.items.slice(0, 5).every((s) => s.source === "a")).toBe(true);
    expect(page2.items.slice(5).every((s) => s.source === "b")).toBe(true);
    expect(page2.complete).toBe(true);
    expect(page2.hasMore).toBe(false);
    expect(page2.total).toBe(35);
  });
});
