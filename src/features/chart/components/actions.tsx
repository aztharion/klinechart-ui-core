import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  useScreenshot,
  useKlinechartsUITheme,
  useFullscreen,
  useDataExport,
  useReplay,
  useMeasure,
} from "@/core/headless";
import { SymbolSearchDialog } from "./SymbolSearchDialog";
import { IndicatorDialog } from "./IndicatorDialog";
import { SettingsDialog } from "./SettingsDialog";
import { TimezoneDialog } from "./TimezoneDialog";
import { ScreenshotDialog } from "./ScreenshotDialog";
import { OrderLinesDialog } from "./OrderLinesDialog";
import { LayoutManagerDialog } from "./LayoutManagerDialog";
import { CompareDialog } from "./CompareDialog";
import { AlertsDialog } from "./AlertsDialog";
import { AnnotationsDialog } from "./AnnotationsDialog";
import { ScriptEditorDialog } from "./ScriptEditorDialog";
import { AlertSound } from "./AlertSound";
import { CommandPalette, type Command } from "./CommandPalette";
import { usePersistentState } from "@/features/chart/hooks/use-persistent-state";
import { useChartT } from "@/features/chart/hooks/use-chart-t";

export type ModalKey =
  | "symbol"
  | "indicators"
  | "settings"
  | "timezone"
  | "screenshot"
  | "orderLines"
  | "layouts"
  | "compare"
  | "alerts"
  | "annotations"
  | "script"
  | "command";

interface OpenOptions {
  /** Pre-fill a price into the opened dialog (e.g. from a right-click on the chart). */
  price?: number;
}

interface TerminalActions {
  open: (key: ModalKey, opts?: OpenOptions) => void;
  /** Capture the chart and open the screenshot preview dialog (with copy / download). */
  screenshot: () => void;
  tradeMode: boolean;
  toggleTrade: () => void;
  disableTradeMode: () => void;
  rrMode: boolean;
  toggleRR: () => void;
  disableRRMode: () => void;
  /** Close the first open chart modal/dialog. Returns true if something was closed. */
  closeAnyOpenModal: () => boolean;
}

const Ctx = createContext<TerminalActions | null>(null);

export function useTerminalActions(): TerminalActions {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTerminalActions must be used within TerminalActionsProvider");
  return ctx;
}

/** Esc closes command palette before other dialogs. */
const MODAL_CLOSE_ORDER: ModalKey[] = [
  "command",
  "symbol",
  "indicators",
  "settings",
  "timezone",
  "screenshot",
  "orderLines",
  "layouts",
  "compare",
  "alerts",
  "annotations",
  "script",
];

const EMPTY: Record<ModalKey, boolean> = {
  symbol: false,
  indicators: false,
  settings: false,
  timezone: false,
  screenshot: false,
  orderLines: false,
  layouts: false,
  compare: false,
  alerts: false,
  annotations: false,
  script: false,
  command: false,
};

export function TerminalActionsProvider({ children }: { children: React.ReactNode }) {
  const { t } = useChartT();
  const [state, setState] = useState<Record<ModalKey, boolean>>(EMPTY);
  const { capture } = useScreenshot();
  const { toggleTheme } = useKlinechartsUITheme();
  const { toggle: toggleFullscreen } = useFullscreen();
  const { exportAll } = useDataExport();
  const { startReplay } = useReplay();
  const { startMeasure } = useMeasure();

  const [pendingPrice, setPendingPrice] = useState<number | null>(null);

  const set = useCallback(
    (key: ModalKey, value: boolean) => setState((s) => ({ ...s, [key]: value })),
    [],
  );
  const open = useCallback(
    (key: ModalKey, opts?: OpenOptions) => {
      setPendingPrice(opts?.price ?? null);
      set(key, true);
    },
    [set],
  );

  const screenshot = useCallback(() => {
    capture();
    set("screenshot", true);
  }, [capture, set]);

  const [tradeMode, setTradeMode] = usePersistentState("trade.mode", false);
  const toggleTrade = useCallback(() => {
    setTradeMode((v) => !v);
  }, [setTradeMode]);

  const [rrMode, setRRMode] = usePersistentState("rr.mode", false);
  const toggleRR = useCallback(() => setRRMode((v) => !v), [setRRMode]);
  const disableTradeMode = useCallback(() => setTradeMode(false), [setTradeMode]);
  const disableRRMode = useCallback(() => setRRMode(false), [setRRMode]);

  const closeAnyOpenModal = useCallback(() => {
    for (const key of MODAL_CLOSE_ORDER) {
      if (state[key]) {
        set(key, false);
        return true;
      }
    }
    return false;
  }, [state, set]);

  const actions = useMemo<TerminalActions>(
    () => ({
      open,
      screenshot,
      tradeMode,
      toggleTrade,
      disableTradeMode,
      rrMode,
      toggleRR,
      disableRRMode,
      closeAnyOpenModal,
    }),
    [
      open,
      screenshot,
      tradeMode,
      toggleTrade,
      disableTradeMode,
      rrMode,
      toggleRR,
      disableRRMode,
      closeAnyOpenModal,
    ],
  );

  const commands = useMemo<Command[]>(
    () => [
      { id: "symbol", label: t("cmd.symbolSearch"), run: () => open("symbol") },
      { id: "indicators", label: t("toolbar.indicators"), run: () => open("indicators") },
      { id: "settings", label: t("cmd.settingsFull"), run: () => open("settings") },
      { id: "timezone", label: t("tools.timezone"), run: () => open("timezone") },
      { id: "orderLines", label: t("tools.orderLines"), run: () => open("orderLines") },
      { id: "layouts", label: t("tools.layouts"), run: () => open("layouts") },
      { id: "compare", label: t("tools.compare"), run: () => open("compare") },
      { id: "alerts", label: t("al.title"), run: () => open("alerts") },
      { id: "annotations", label: t("tools.annotations"), run: () => open("annotations") },
      { id: "script", label: t("tools.script"), run: () => open("script") },
      { id: "measure", label: t("tools.measure"), run: startMeasure },
      { id: "replay", label: t("tools.replay"), run: startReplay },
      { id: "screenshot", label: t("cmd.screenshot"), run: screenshot },
      { id: "export-csv", label: t("cmd.exportCsvFull"), hint: "CSV", run: () => exportAll("csv") },
      { id: "export-json", label: t("cmd.exportJsonFull"), hint: "JSON", run: () => exportAll("json") },
      { id: "theme", label: t("cmd.theme"), run: toggleTheme },
      { id: "fullscreen", label: t("toolbar.fullscreen"), run: toggleFullscreen },
    ],
    [t, open, screenshot, startMeasure, startReplay, exportAll, toggleTheme, toggleFullscreen],
  );

  // Ctrl/Cmd+K opens the command palette.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        set("command", true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [set]);

  return (
    <Ctx.Provider value={actions}>
      {children}

      <SymbolSearchDialog open={state.symbol} onOpenChange={(o) => set("symbol", o)} />
      <IndicatorDialog open={state.indicators} onOpenChange={(o) => set("indicators", o)} />
      <SettingsDialog open={state.settings} onOpenChange={(o) => set("settings", o)} />
      <TimezoneDialog open={state.timezone} onOpenChange={(o) => set("timezone", o)} />
      <ScreenshotDialog open={state.screenshot} onOpenChange={(o) => set("screenshot", o)} />
      <OrderLinesDialog
        open={state.orderLines}
        onOpenChange={(o) => set("orderLines", o)}
        initialPrice={pendingPrice}
      />
      <LayoutManagerDialog open={state.layouts} onOpenChange={(o) => set("layouts", o)} />
      <CompareDialog open={state.compare} onOpenChange={(o) => set("compare", o)} />
      <AlertsDialog
        open={state.alerts}
        onOpenChange={(o) => set("alerts", o)}
        initialPrice={pendingPrice}
      />
      <AnnotationsDialog open={state.annotations} onOpenChange={(o) => set("annotations", o)} />
      <ScriptEditorDialog open={state.script} onOpenChange={(o) => set("script", o)} />
      <CommandPalette
        open={state.command}
        onOpenChange={(o) => set("command", o)}
        commands={commands}
      />
      <AlertSound />
    </Ctx.Provider>
  );
}
