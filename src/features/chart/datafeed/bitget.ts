import { ManagedSocket } from "./ws";
import { OrderBookState } from "./orderbook";
import { filterSymbolUniverse, SEARCH_MATCH_LIMIT } from "./search-utils";
import type {
  DataSource,
  DepthSnapshot,
  KLineData,
  PartialSymbolInfo,
  SymbolInfo,
  TerminalPeriod,
} from "./types";

const REST = "https://api.bitget.com/api/v2/spot";
const WS = "wss://ws.bitget.com/v2/ws/public";

const POPULAR: PartialSymbolInfo[] = [
  { ticker: "BTCUSDT", name: "Bitcoin / Tether", pricePrecision: 2, volumePrecision: 6 },
  { ticker: "ETHUSDT", name: "Ethereum / Tether", pricePrecision: 2, volumePrecision: 5 },
  { ticker: "SOLUSDT", name: "Solana / Tether", pricePrecision: 3, volumePrecision: 2 },
  { ticker: "XRPUSDT", name: "XRP / Tether", pricePrecision: 4, volumePrecision: 1 },
  { ticker: "DOGEUSDT", name: "Dogecoin / Tether", pricePrecision: 5, volumePrecision: 0 },
];

function periodToGranularity(period: TerminalPeriod): string {
  const { span, type } = period;
  switch (type) {
    case "minute":
      if (span === 1) return "1min";
      if (span === 3) return "3min";
      if (span === 5) return "5min";
      if (span === 15) return "15min";
      if (span === 30) return "30min";
      return "1min";
    case "hour":
      if (span === 1) return "1h";
      if (span === 4) return "4h";
      if (span === 6) return "6h";
      if (span === 12) return "12h";
      return "1h";
    case "day":
      return "1day";
    case "week":
      return "1week";
    case "month":
      return "1M";
    default:
      return "1day";
  }
}

function periodToWsChannel(period: TerminalPeriod): string {
  const { span, type } = period;
  switch (type) {
    case "minute":
      return `candle${span}m`;
    case "hour":
      return `candle${span}H`;
    case "day":
      return "candle1D";
    case "week":
      return "candle1W";
    case "month":
      return "candle1M";
    default:
      return "candle1D";
  }
}

interface BitgetSymbol {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  status: string;
  pricePrecision?: string;
  quantityPrecision?: string;
}

interface BitgetSubscribeArg {
  instType: "SPOT";
  channel: string;
  instId: string;
}

export class BitgetDataSource implements DataSource {
  readonly id = "bitget";
  readonly label = "Bitget";

  private universe: PartialSymbolInfo[] | null = null;
  private universePromise: Promise<PartialSymbolInfo[]> | null = null;

  private socket: ManagedSocket | null = null;
  private topics = new Map<string, Set<(data: KLineData) => void>>();

  private loadUniverse(): Promise<PartialSymbolInfo[]> {
    if (this.universe) return Promise.resolve(this.universe);
    if (this.universePromise) return this.universePromise;

    this.universePromise = fetch(`${REST}/public/symbols`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("symbols failed"))))
      .then((data: { data?: BitgetSymbol[] }) => {
        const list = (data.data ?? [])
          .filter((s) => s.status === "online")
          .map<PartialSymbolInfo>((s) => ({
            ticker: s.symbol,
            name: `${s.baseCoin} / ${s.quoteCoin}`,
            shortName: s.symbol,
            pricePrecision: s.pricePrecision
              ? Number.parseInt(s.pricePrecision, 10)
              : 2,
            volumePrecision: s.quantityPrecision
              ? Number.parseInt(s.quantityPrecision, 10)
              : 2,
          }))
          .sort((a, b) => a.ticker.localeCompare(b.ticker));
        this.universe = list;
        return list;
      })
      .catch(() => {
        this.universe = POPULAR;
        return POPULAR;
      });

    return this.universePromise;
  }

  async listFilteredSymbols(search: string): Promise<PartialSymbolInfo[]> {
    const universe = this.universe ?? (await this.loadUniverse());
    return filterSymbolUniverse(universe, search, POPULAR);
  }

  async searchSymbols(search: string): Promise<PartialSymbolInfo[]> {
    const list = await this.listFilteredSymbols(search);
    return list.slice(0, SEARCH_MATCH_LIMIT);
  }

  async getHistoryKLineData(
    symbol: SymbolInfo,
    period: TerminalPeriod,
    _from: number,
    to: number,
  ): Promise<KLineData[]> {
    const url = new URL(`${REST}/market/candles`);
    url.searchParams.set("symbol", symbol.ticker);
    url.searchParams.set("granularity", periodToGranularity(period));
    url.searchParams.set("endTime", String(to));
    url.searchParams.set("limit", "1000");

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data: { data?: string[][] } = await res.json();
    return (data.data ?? []).map((k) => ({
      timestamp: Number(k[0]),
      open: parseFloat(k[1]),
      high: parseFloat(k[2]),
      low: parseFloat(k[3]),
      close: parseFloat(k[4]),
      volume: parseFloat(k[5]),
      turnover: parseFloat(k[6] ?? k[5]),
    }));
  }

  private topicKey(arg: BitgetSubscribeArg): string {
    return `${arg.instType}|${arg.channel}|${arg.instId}`;
  }

  private argFor(symbol: SymbolInfo, period: TerminalPeriod): BitgetSubscribeArg {
    return {
      instType: "SPOT",
      channel: periodToWsChannel(period),
      instId: symbol.ticker,
    };
  }

  private ensureSocket(): ManagedSocket {
    if (this.socket) return this.socket;
    this.socket = new ManagedSocket(WS, {
      ping: () => "ping",
      pingIntervalMs: 30_000,
      onOpen: () => {
        for (const key of this.topics.keys()) {
          const [instType, channel, instId] = key.split("|");
          this.socket!.send({
            op: "subscribe",
            args: [{ instType, channel, instId }],
          });
        }
      },
      onMessage: (raw) => {
        const msg = raw as {
          action?: string;
          arg?: BitgetSubscribeArg;
          data?: string[][];
        };
        if (!msg.arg || !msg.data?.length) return;
        const callbacks = this.topics.get(this.topicKey(msg.arg));
        if (!callbacks) return;
        for (const k of msg.data) {
          const bar: KLineData = {
            timestamp: Number(k[0]),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
            turnover: parseFloat(k[6] ?? k[5]),
          };
          callbacks.forEach((cb) => cb(bar));
        }
      },
    });
    return this.socket;
  }

  subscribe(
    symbol: SymbolInfo,
    period: TerminalPeriod,
    callback: (data: KLineData) => void,
  ): void {
    const arg = this.argFor(symbol, period);
    const key = this.topicKey(arg);
    const existing = this.topics.get(key);
    if (existing) {
      existing.add(callback);
      return;
    }
    this.topics.set(key, new Set([callback]));
    this.ensureSocket().send({ op: "subscribe", args: [arg] });
  }

  unsubscribe(symbol: SymbolInfo, period: TerminalPeriod): void {
    const arg = this.argFor(symbol, period);
    if (!this.topics.delete(this.topicKey(arg))) return;
    this.socket?.send({ op: "unsubscribe", args: [arg] });
  }

  subscribeDepth(
    symbol: SymbolInfo,
    callback: (depth: DepthSnapshot) => void,
  ): () => void {
    const arg: BitgetSubscribeArg = {
      instType: "SPOT",
      channel: "books5",
      instId: symbol.ticker,
    };
    const book = new OrderBookState();
    const socket = new ManagedSocket(WS, {
      ping: () => "ping",
      pingIntervalMs: 30_000,
      onOpen: () => socket.send({ op: "subscribe", args: [arg] }),
      onMessage: (raw) => {
        const msg = raw as {
          action?: string;
          arg?: BitgetSubscribeArg;
          data?: Array<{ bids?: string[][]; asks?: string[][] }>;
        };
        if (msg.arg?.channel !== "books5" || msg.arg.instId !== symbol.ticker || !msg.data) {
          return;
        }
        for (const d of msg.data) {
          if (msg.action === "snapshot") book.applySnapshot(d.bids ?? [], d.asks ?? []);
          else book.applyDelta(d.bids, d.asks);
        }
        callback(book.top(5));
      },
    });
    socket.open();
    return () => {
      socket.send({ op: "unsubscribe", args: [arg] });
      socket.close();
    };
  }
}
