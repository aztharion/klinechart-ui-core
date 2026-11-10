import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useChartT } from "@/features/chart/hooks/use-chart-t"
import {
  KlinechartsUIProvider,
  useFullscreen,
  useKlinechartsUI,
  useKlinechartsUITheme,
  useKlinechartsUILoading,
} from "@/core/headless"
import { orderLineOverlay } from "@/features/chart/lib/order-line-overlay"
import {
  longPositionOverlay,
  shortPositionOverlay,
} from "@/features/chart/lib/position-overlays"
import { fixedRangeVolumeProfileOverlay } from "@/features/chart/lib/volume-profile/frvp-overlay"
import {
  datafeed as defaultDatafeedRegistry,
  defaultSymbol,
  type DatafeedRegistry,
  type PartialSymbolInfo,
  type TerminalPeriod,
} from "@/features/chart/datafeed"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { chartLocale } from "@/features/chart/utils/chart-locale"
import { ensureChartSymbolSource } from "@/features/chart/utils/chart-symbol-url"
import {
  resolveInitialChartBootstrap,
  syncChartSymbolToUrl,
} from "@/features/chart/utils/chart-url-state"
import {
  loadPersistedIndicators,
  savePersistedIndicatorLists,
} from "@/features/chart/utils/chart-indicator-persistence"
import { useSyncTheme } from "@/features/chart/hooks/use-sync-theme"
import { useChartDocumentTitle } from "@/features/chart/hooks/use-chart-document-title"
import {
  loadPersisted,
  savePersisted,
  usePersistentState,
} from "@/features/chart/hooks/use-persistent-state"
import { Toolbar } from "./Toolbar"
import { DrawingSidebar } from "./DrawingSidebar"
import { DrawingPanelToggle } from "./DrawingPanelToggle"
import { ChartView } from "./ChartView"
import { RightDock } from "./RightDock"
import { StatusBar } from "./StatusBar"
import { KeyboardShortcuts } from "./KeyboardShortcuts"
import { ReplayControls } from "./ReplayControls"
import { TerminalActionsProvider } from "./actions"
import { ChartCandleTypesProvider } from "@/features/chart/hooks/use-chart-candle-types"
import { ChartInteractionProvider } from "@/features/chart/context/chart-interaction-context"
import { ChartDrawingToolsProvider } from "@/features/chart/context/chart-drawing-tools-context"

function TerminalLayout({
  compact = false,
  appName,
}: {
  compact?: boolean
  appName?: string
}) {
  const { i18n } = useChartT()
  const { containerRef } = useFullscreen()
  const { dispatch } = useKlinechartsUI()
  const { theme } = useKlinechartsUITheme()
  const { isLoading } = useKlinechartsUILoading()
  const [showDrawing, setShowDrawing] = usePersistentState(
    "panel.drawing",
    true
  )

  useSyncTheme(theme)
  useChartDocumentTitle(appName)

  useEffect(() => {
    dispatch({ type: "SET_LOCALE", locale: chartLocale(i18n.language) })
  }, [i18n.language, dispatch])

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={cn("flex flex-col bg-background text-foreground", compact ? "h-full min-h-0" : "h-svh")}
    >
      <ChartCandleTypesProvider>
        <ChartDrawingToolsProvider>
          <ChartInteractionProvider>
            <TerminalActionsProvider>
              <header className="flex h-11 min-w-0 shrink-0 items-center gap-1 border-b border-border/80 px-1.5 bg-card/50">
                <DrawingPanelToggle
                  showDrawing={showDrawing}
                  onToggleDrawing={() => setShowDrawing((v) => !v)}
                />
                <Separator orientation="vertical" className="mx-1 hidden shrink-0 self-stretch sm:block" />
                <Toolbar />
              </header>

              <div className="flex flex-1 overflow-hidden">
                {!compact && showDrawing && <DrawingSidebar />}

                <div className="relative z-0 min-w-0 flex-1">
                  <ChartView className="absolute inset-0" />
                  {isLoading && (
                    <span className="pointer-events-none absolute top-1/2 left-1/2 size-8 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  )}
                </div>

                {!compact && <RightDock />}
              </div>

              <ReplayControls />
              <StatusBar />
              <KeyboardShortcuts />
            </TerminalActionsProvider>
          </ChartInteractionProvider>
        </ChartDrawingToolsProvider>
      </ChartCandleTypesProvider>
    </div>
  )
}

export type TradingTerminalProps = {
  className?: string
  initialSymbol?: PartialSymbolInfo
  initialPeriod?: TerminalPeriod
  compact?: boolean
  datafeed?: DatafeedRegistry
  appName?: string
}

export function TradingTerminal({
  className,
  initialSymbol,
  initialPeriod,
  compact = false,
  datafeed: customDatafeed,
  appName = "KlineChart",
}: TradingTerminalProps) {
  const { i18n } = useChartT()
  const [searchParams, setSearchParams] = useSearchParams()
  const trackReady = useRef(false)
  const [bootstrap] = useState(() => {
    const state = resolveInitialChartBootstrap(searchParams)
    const symbol: PartialSymbolInfo = initialSymbol ?? state.symbol
    savePersisted("symbol", symbol)
    return { ...state, symbol, period: initialPeriod ?? state.period }
  })
  const terminalDatafeed = useMemo(
    () => customDatafeed ?? defaultDatafeedRegistry,
    [customDatafeed],
  )
  const initialTheme = loadPersisted<string>("theme", "light")

  useEffect(() => {
    syncChartSymbolToUrl(setSearchParams, bootstrap.symbol)
    trackReady.current = true
  }, [bootstrap.symbol, setSearchParams])

  return (
    <div className={cn(className)}>
      <KlinechartsUIProvider
        datafeed={terminalDatafeed}
        defaultSymbol={bootstrap.symbol}
        defaultPeriod={bootstrap.period}
        defaultTheme={initialTheme}
        defaultLocale={chartLocale(i18n.language)}
        defaultMainIndicators={bootstrap.indicators.main}
        defaultSubIndicators={bootstrap.indicators.sub}
        overlays={[orderLineOverlay, longPositionOverlay, shortPositionOverlay, fixedRangeVolumeProfileOverlay]}
        onSymbolChange={(s) => {
          const resolved = ensureChartSymbolSource(
            s,
            loadPersisted("symbol", defaultSymbol),
          )
          savePersisted("symbol", resolved)
          if (!trackReady.current) return
          syncChartSymbolToUrl(setSearchParams, resolved)
        }}
        onPeriodChange={(p) => {
          savePersisted("period", p.label)
        }}
        onMainIndicatorsChange={(main) => {
          const current = loadPersistedIndicators()
          savePersistedIndicatorLists(main, current.sub)
        }}
        onSubIndicatorsChange={(subMap) => {
          const sub = Object.keys(subMap)
          const current = loadPersistedIndicators()
          savePersistedIndicatorLists(current.main, sub)
        }}
        onThemeChange={(t) => savePersisted("theme", t)}
      >
        <TooltipProvider delayDuration={0}>
          <TerminalLayout compact={compact} appName={appName} />
        </TooltipProvider>
      </KlinechartsUIProvider>
    </div>
  )
}
