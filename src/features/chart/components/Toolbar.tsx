import {
  usePeriods,
  useKlinechartsUI,
  useKlinechartsUITheme,
  useFullscreen,
  useSymbolSearch,
  useUndoRedo,
  useDataExport,
  useReplay,
  useMeasure,
  useIndicators,
} from "@/core/headless";
import {
  Sun,
  Moon,
  Maximize,
  Minimize,
  Camera,
  Settings,
  BarChart3,
  Globe,
  Search,
  ChevronDown,
  Undo2,
  Redo2,
  Clock,
  Check,
  TrendingUp,
  Bell,
  GitCompareArrows,
  Ruler,
  Play,
  Code2,
  Save,
  Download,
  StickyNote,
  Command as CommandIcon,
  CircleDollarSign,
  Zap,
  Target,
  Wrench,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { useTerminalActions } from "./actions";
import { ChartLanguageSwitcher } from "./ChartLanguageSwitcher";
import { LANGUAGE_OPTIONS } from "./ChartLanguageSwitcher";
import { useChartCandleTypes } from "@/features/chart/hooks/use-chart-candle-types";
import { CandleTypeIcon } from "./chart-candle-type-icons";
import type { RoutedSymbolInfo } from "@/features/chart/datafeed";
import { useLanguage } from "@/hooks/use-language";

// Quick-access indicators list: [name, is_main_indicator]
const QUICK_INDICATORS: { name: string; label: string; isMain: boolean }[] = [
  { name: "MA",   label: "MA",   isMain: true },
  { name: "EMA",  label: "EMA",  isMain: true },
  { name: "BOLL", label: "BOLL", isMain: true },
  { name: "SAR",  label: "SAR",  isMain: true },
  { name: "VPVR", label: "VP",   isMain: true },
  { name: "RSI",  label: "RSI",  isMain: false },
  { name: "MACD", label: "MACD", isMain: false },
  { name: "KDJ",  label: "KDJ",  isMain: false },
  { name: "VOL",  label: "VOL",  isMain: false },
  { name: "OBV",  label: "OBV",  isMain: false },
  { name: "CCI",  label: "CCI",  isMain: false },
  { name: "ATR",  label: "ATR",  isMain: false },
  { name: "AVL",  label: "AVL",  isMain: false },
];


export function Toolbar() {
  const { t } = useChartT();
  const { state } = useKlinechartsUI();
  const { periods, activePeriod, setPeriod } = usePeriods();
  const { theme, toggleTheme } = useKlinechartsUITheme();
  const { selectedType, candleTypes, setChartType } = useChartCandleTypes();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const { activeSymbol } = useSymbolSearch();
  const { canUndo, canRedo, undo, redo } = useUndoRedo();
  const { startReplay } = useReplay();
  const { startMeasure } = useMeasure();
  const { exportAll } = useDataExport();
  const { open, screenshot, tradeMode, toggleTrade, rrMode, toggleRR } = useTerminalActions();
  const ind = useIndicators();
  const { currentLanguage, changeLanguage } = useLanguage();

  const source =
    (state.symbol as RoutedSymbolInfo | null)?.source ??
    (activeSymbol as RoutedSymbolInfo | undefined)?.source;

  const isActivePeriod = (p: (typeof periods)[number]) =>
    activePeriod.span === p.span && activePeriod.type === p.type;

  const isIndicatorActive = (name: string, isMain: boolean) =>
    isMain
      ? ind.activeMainIndicators.includes(name)
      : Object.keys(ind.activeSubIndicators).includes(name);

  const toggleQuickIndicator = (name: string, isMain: boolean) => {
    if (isMain) {
      ind.toggleMainIndicator(name);
    } else {
      ind.toggleSubIndicator(name);
    }
  };

  const scrollClassName =
    "flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-md:pr-1";

  const menuBtnClass =
    "h-7 shrink-0 gap-1 px-2 max-lg:size-7 max-lg:px-0";

  const rrButton = (
    <Tooltip content="R/R Tool">
      <Button
        variant={rrMode ? "default" : "secondary"}
        size="sm"
        onClick={toggleRR}
        className="shrink-0 gap-1.5 max-md:px-2"
      >
        <Target className="size-4" />
        <span className="max-md:hidden">R/R</span>
      </Button>
    </Tooltip>
  );

  const tradeButton = (
    <Tooltip content={t("toolbar.tradeMode")}>
      <Button
        variant={tradeMode ? "default" : "secondary"}
        size="sm"
        onClick={toggleTrade}
        className="shrink-0 gap-1.5 max-md:px-2"
      >
        <CircleDollarSign className="size-4" />
        <span className="max-md:hidden">{t("toolbar.trade")}</span>
      </Button>
    </Tooltip>
  );

  const moreMenu = (
    <DropdownMenu>
      <Tooltip content={t("toolbar.more")}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem onClick={() => open("settings")}>
          <Settings className="size-4" /> {t("toolbar.settings")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={screenshot}>
          <Camera className="size-4" /> {t("toolbar.screenshot")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {t("toolbar.theme")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
          {t("toolbar.fullscreen")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open("command")}>
          <CommandIcon className="size-4" /> {t("toolbar.commandPalette")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("settings.language")}</DropdownMenuLabel>
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => changeLanguage(lang.value)}
            className={
              currentLanguage === lang.value ? "font-medium text-primary" : ""
            }
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex min-w-0 flex-1 items-center">
      <div className={scrollClassName}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => open("symbol")}
        className="max-w-[9.5rem] shrink-0 gap-1 font-semibold max-md:max-w-[5.5rem] max-md:px-1.5"
      >
        <Search className="size-3.5 shrink-0 text-muted-foreground max-md:hidden" />
        <span className="truncate">
          {String(activeSymbol?.ticker ?? state.symbol?.ticker ?? t("toolbar.symbol"))}
        </span>
        {source && (
          <Badge variant="secondary" className="hidden font-normal sm:inline-flex">
            {source}
          </Badge>
        )}
        <ChevronDown className="size-3 shrink-0 text-muted-foreground max-md:hidden" />
      </Button>

      <Separator orientation="vertical" className="mx-1 hidden shrink-0 self-stretch sm:block" />

      {/* Periods */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="shrink-0 gap-1 px-2 xl:hidden">
            <Clock className="size-3.5 shrink-0 text-muted-foreground max-md:hidden" />
            <span>{activePeriod.label}</span>
            <ChevronDown className="size-3 shrink-0 text-muted-foreground max-md:hidden" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {periods.map((period) => (
            <DropdownMenuItem key={period.label} onClick={() => setPeriod(period)}>
              {isActivePeriod(period) && <Check className="size-3.5" />}
              {period.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="hidden items-center gap-0.5 xl:flex">
        {periods.map((period) => (
          <Button
            key={period.label}
            variant={isActivePeriod(period) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setPeriod(period)}
          >
            {period.label}
          </Button>
        ))}
      </div>

      <Separator orientation="vertical" className="mx-1 hidden shrink-0 self-stretch sm:block" />

      {/* Chart type */}
      <DropdownMenu>
        <Tooltip content={t("toolbar.chartType")}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={menuBtnClass}>
              <CandleTypeIcon type={selectedType} className="size-4 shrink-0" />
              <ChevronDown className="hidden size-3 shrink-0 text-muted-foreground lg:inline" />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuLabel>{t("toolbar.chartType")}</DropdownMenuLabel>
          {candleTypes.map((c) => (
            <DropdownMenuItem
              key={c.key}
              onClick={() => setChartType(c.key)}
              className="gap-2"
            >
              {selectedType === c.key ? (
                <Check className="size-3.5 shrink-0" />
              ) : (
                <span className="size-3.5 shrink-0" />
              )}
              <CandleTypeIcon type={c.key} />
              <span className="whitespace-nowrap">{t(`candle.${c.key}`)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Quick Indicator Dropdown */}
      <DropdownMenu>
        <Tooltip content={t("toolbar.indicators")}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={menuBtnClass}>
              <BarChart3 className="size-4 shrink-0" />
              <span className="hidden whitespace-nowrap xl:inline">{t("toolbar.indicators")}</span>
              <ChevronDown className="hidden size-3 shrink-0 text-muted-foreground xl:inline" />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="min-w-44">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">{t("toolbar.indicatorsOnChart")}</DropdownMenuLabel>
          {QUICK_INDICATORS.filter((i) => i.isMain).map((i) => (
            <DropdownMenuItem key={i.name} onClick={() => toggleQuickIndicator(i.name, true)} className="gap-2">
              {isIndicatorActive(i.name, true)
                ? <Check className="size-3.5 text-primary" />
                : <span className="size-3.5" />}
              <span>{i.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wide">{t("toolbar.indicatorsInPanes")}</DropdownMenuLabel>
          {QUICK_INDICATORS.filter((i) => !i.isMain).map((i) => (
            <DropdownMenuItem key={i.name} onClick={() => toggleQuickIndicator(i.name, false)} className="gap-2">
              {isIndicatorActive(i.name, false)
                ? <Check className="size-3.5 text-primary" />
                : <span className="size-3.5" />}
              <span>{i.label}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => open("indicators")} className="text-muted-foreground">
            <Zap className="size-3.5" /> {t("toolbar.allIndicators")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>


      {/* Tools overflow menu */}
      <DropdownMenu>
        <Tooltip content={t("toolbar.tools")}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={menuBtnClass}>
              <Wrench className="size-4 shrink-0" />
              <span className="hidden whitespace-nowrap xl:inline">{t("toolbar.tools")}</span>
              <ChevronDown className="hidden size-3 shrink-0 text-muted-foreground xl:inline" />
            </Button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start" className="min-w-52">
          <DropdownMenuItem onClick={() => open("orderLines")}>
            <TrendingUp className="size-4" /> {t("tools.orderLines")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("alerts")}>
            <Bell className="size-4" /> {t("tools.alerts")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("compare")}>
            <GitCompareArrows className="size-4" /> {t("tools.compare")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("annotations")}>
            <StickyNote className="size-4" /> {t("tools.annotations")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={startMeasure}>
            <Ruler className="size-4" /> {t("tools.measure")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={startReplay}>
            <Play className="size-4" /> {t("tools.replay")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("script")}>
            <Code2 className="size-4" /> {t("tools.script")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => open("layouts")}>
            <Save className="size-4" /> {t("tools.layouts")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => open("timezone")}>
            <Globe className="size-4" /> {t("tools.timezone")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportAll("csv")}>
            <Download className="size-4" /> {t("tools.exportCsv")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => exportAll("json")}>
            <Download className="size-4" /> {t("tools.exportJson")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      <div className="hidden shrink-0 items-center gap-0.5 md:flex">
      <Tooltip content={t("toolbar.settings")}>
        <Button variant="ghost" size="icon-sm" className="max-md:hidden" onClick={() => open("settings")}>
          <Settings className="size-4" />
        </Button>
      </Tooltip>

      <div className="hidden flex-1 md:block" />

      <Tooltip content={t("toolbar.commandPalette")}>
        <Button variant="ghost" size="icon-sm" className="max-md:hidden" onClick={() => open("command")}>
          <CommandIcon className="size-4" />
        </Button>
      </Tooltip>

      <Tooltip content={t("toolbar.undo")}>
        <Button variant="ghost" size="icon-sm" className="max-lg:hidden" onClick={undo} disabled={!canUndo}>
          <Undo2 className="size-4" />
        </Button>
      </Tooltip>
      <Tooltip content={t("toolbar.redo")}>
        <Button variant="ghost" size="icon-sm" className="max-lg:hidden" onClick={redo} disabled={!canRedo}>
          <Redo2 className="size-4" />
        </Button>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 hidden shrink-0 self-stretch max-lg:block max-md:hidden" />

      <Tooltip content={t("toolbar.screenshot")}>
        <Button variant="ghost" size="icon-sm" className="max-md:hidden" onClick={screenshot}>
          <Camera className="size-4" />
        </Button>
      </Tooltip>
      <div className="max-md:hidden">
        <ChartLanguageSwitcher />
      </div>
      <Tooltip content={t("toolbar.theme")}>
        <Button variant="ghost" size="icon-sm" className="max-md:hidden" onClick={toggleTheme}>
          {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </Button>
      </Tooltip>
      <Tooltip content={t("toolbar.fullscreen")}>
        <Button variant="ghost" size="icon-sm" className="max-md:hidden" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
        </Button>
      </Tooltip>

      <Separator orientation="vertical" className="mx-1 hidden shrink-0 self-stretch max-xl:block" />

      {rrButton}
      {tradeButton}
      </div>

      <div className="flex shrink-0 items-center gap-0.5 border-l border-border pl-0.5 md:hidden">
        {rrButton}
        {tradeButton}
        {moreMenu}
      </div>
    </div>
  );
}
