import { useEffect } from "react";
import {
  usePeriods,
  useKlinechartsUITheme,
  useFullscreen,
  useReplay,
  useMeasure,
} from "@/core/headless";
import { useTerminalActions } from "./actions";
import { useChartInteraction } from "@/features/chart/context/chart-interaction-context";
import { useChartDrawingTools } from "@/features/chart/context/chart-drawing-tools-context";
import { useChartEscCascade } from "@/features/chart/hooks/use-chart-esc-cascade";

/** True when focus is in an editable field — keystrokes must pass through. */
function inEditable(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

/**
 * App-wide keyboard shortcuts. Single-key bindings are ignored while typing in
 * an input. Undo/redo (Ctrl+Z / Ctrl+Y) are handled inside `useUndoRedo`, and
 * the command palette (Ctrl/Cmd+K) inside the actions provider.
 */
export function KeyboardShortcuts() {
  const { periods, setPeriod } = usePeriods();
  const { activeTool, clearActiveTool, selectTool } = useChartDrawingTools();
  const { toggleTheme } = useKlinechartsUITheme();
  const { toggle: toggleFullscreen } = useFullscreen();
  const { startReplay } = useReplay();
  const { startMeasure } = useMeasure();
  const { open } = useTerminalActions();
  const { focusedTarget, deleteFocusedTarget } = useChartInteraction();
  const handleEscape = useChartEscCascade();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (handleEscape()) {
          e.preventDefault();
          e.stopPropagation();
        }
        return;
      }

      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        focusedTarget &&
        !inEditable(e.target)
      ) {
        e.preventDefault();
        deleteFocusedTarget();
        return;
      }

      // Don't hijack modifier combos or typing in fields.
      if (e.ctrlKey || e.metaKey || e.altKey || inEditable(e.target)) return;

      // Digits 1–9 / 0 → select timeframe by position.
      if (/^[0-9]$/.test(e.key)) {
        const idx = e.key === "0" ? 9 : Number(e.key) - 1;
        const period = periods[idx];
        if (period) {
          e.preventDefault();
          setPeriod(period);
        }
        return;
      }

      // Alt + key → quick drawing tools (does not conflict with existing shortcuts)
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const drawMap: Record<string, string> = {
          t: "straight_line",
          h: "horizontal_straight_line",
          v: "vertical_straight_line",
          r: "rect",
          f: "fibonacci_line",
          p: "price_line",
        };
        const tool = drawMap[e.key.toLowerCase()];
        if (tool) {
          e.preventDefault();
          selectTool(tool);
          return;
        }
      }

      const map: Record<string, () => void> = {
        "/": () => open("symbol"),
        i: () => open("indicators"),
        o: () => open("orderLines"),
        a: () => open("alerts"),
        c: () => open("compare"),
        n: () => open("annotations"),
        l: () => open("layouts"),
        g: () => open("settings"),
        z: () => open("timezone"),
        e: () => open("script"),
        m: startMeasure,
        r: startReplay,
        t: toggleTheme,
        f: toggleFullscreen,
      };
      const fn = map[e.key.toLowerCase()];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    periods,
    setPeriod,
    activeTool,
    clearActiveTool,
    selectTool,
    toggleTheme,
    toggleFullscreen,
    startReplay,
    startMeasure,
    open,
    focusedTarget,
    deleteFocusedTarget,
    handleEscape,
  ]);

  return null;
}
