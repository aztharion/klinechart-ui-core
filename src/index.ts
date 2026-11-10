// Core components
export { TradingTerminal, type TradingTerminalProps } from "./features/chart/components/TradingTerminal"
export { ChartView } from "./features/chart/components/ChartView"
export { Toolbar } from "./features/chart/components/Toolbar"
export { DrawingSidebar } from "./features/chart/components/DrawingSidebar"
export { DrawingPanelToggle } from "./features/chart/components/DrawingPanelToggle"
export { RightDock } from "./features/chart/components/RightDock"
export { StatusBar } from "./features/chart/components/StatusBar"
export { WatchlistPanel } from "./features/chart/components/WatchlistPanel"
export { OrderBookPanel } from "./features/chart/components/OrderBookPanel"
export { SymbolInfoPanel } from "./features/chart/components/SymbolInfoPanel"
export { ChartBuySell } from "./features/chart/components/ChartBuySell"
export { ChartRRTool } from "./features/chart/components/ChartRRTool"
export {
  ChartJournalTradeDialog,
  type ChartJournalTradeDraft,
  type ChartAccountOption,
  type ChartJournalTradeDialogProps,
} from "./features/chart/components/ChartJournalTradeDialog"

// Datafeeds
export {
  datafeed,
  defaultSymbol,
  DatafeedRegistry,
  createDatafeed,
  BinanceDataSource,
  BybitDataSource,
  OkxDataSource,
  BitgetDataSource,
  SyntheticDataSource,
} from "./features/chart/datafeed"
export type * from "./features/chart/datafeed/types"

// Overlays
export { orderLineOverlay } from "./features/chart/lib/order-line-overlay"
export {
  longPositionOverlay,
  shortPositionOverlay,
  ensurePositionOverlaysRegistered,
} from "./features/chart/lib/position-overlays"
export {
  fixedRangeVolumeProfileOverlay,
  FRVP_OVERLAY_NAME,
  ensureFrvpOverlayRegistered,
} from "./features/chart/lib/volume-profile/frvp-overlay"
export {
  ensureVpvrIndicatorRegistered,
  getVpvrSnapshot,
} from "./features/chart/lib/volume-profile/vpvr-indicator"
export {
  VPVR_INDICATOR_NAME,
} from "./features/chart/lib/volume-profile/types"

// Contexts & Hooks
export {
  ChartInteractionProvider,
  useChartInteraction,
} from "./features/chart/context/chart-interaction-context"
export {
  ChartDrawingToolsProvider,
  useChartDrawingTools,
} from "./features/chart/context/chart-drawing-tools-context"
export {
  TerminalActionsProvider,
  useTerminalActions,
  type ModalKey,
} from "./features/chart/components/actions"
export { useChartT } from "./features/chart/hooks/use-chart-t"
export { useLivePrice } from "./features/chart/hooks/use-live-price"
export { usePersistentState, loadPersisted, savePersisted } from "./features/chart/hooks/use-persistent-state"
export { useChartTradeOverlays, type TradeOverlayItem } from "./features/chart/hooks/use-chart-trade-overlays"
export { useLanguage } from "./hooks/use-language"

// Icons
export * from "./features/chart/components/tradingview-icons"

// Inlined Headless Core & React Klinechart Engine
export * from "./core/headless"
export * from "./core/klinechart"
export type { TooltipShowRule } from "./core/klinechart"

// Styles
import "./features/chart/chart.css"
