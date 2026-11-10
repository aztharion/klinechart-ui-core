import { createDatafeed } from "./registry";
import { BinanceDataSource } from "./binance";
import { BybitDataSource } from "./bybit";
import { OkxDataSource } from "./okx";
import { BitgetDataSource } from "./bitget";
import { SyntheticDataSource } from "./synthetic";
import type { PartialSymbolInfo } from "./types";

export * from "./types";
export { DatafeedRegistry, createDatafeed } from "./registry";
export { BinanceDataSource } from "./binance";
export { BybitDataSource } from "./bybit";
export { OkxDataSource } from "./okx";
export { BitgetDataSource } from "./bitget";
export { SyntheticDataSource } from "./synthetic";

/**
 * Default terminal datafeed. Sources below use CORS-friendly public REST +
 * native kline WebSockets — no API key and no backend proxy required.
 * Synthetic is the offline fallback.
 */
export const datafeed = createDatafeed([
  new BinanceDataSource(),
  new BybitDataSource(),
  new OkxDataSource(),
  new BitgetDataSource(),
  new SyntheticDataSource(),
]);

export const defaultSymbol: PartialSymbolInfo = {
  ticker: "BTCUSDT",
  name: "Bitcoin / TetherUS",
  pricePrecision: 2,
  volumePrecision: 5,
  source: "binance",
};
