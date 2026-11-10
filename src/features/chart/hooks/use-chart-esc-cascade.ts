import { useCallback } from "react";
import {
  useKlinechartsUI,
  useMeasure,
  useReplay,
} from "@/core/headless";
import { useTerminalActions } from "@/features/chart/components/actions";
import { useChartInteraction } from "@/features/chart/context/chart-interaction-context";
import { useChartDrawingTools } from "@/features/chart/context/chart-drawing-tools-context";
import {
  isChartOverlayDrawing,
  selectCursorMode,
} from "@/features/chart/lib/cancel-drawing-in-progress";

/**
 * TradingView-style Esc: one step per keypress. Any chart-mode exit also
 * selects the cursor (crosshair) tool.
 */
export function useChartEscCascade() {
  const { closeAnyOpenModal, tradeMode, rrMode, disableTradeMode, disableRRMode } =
    useTerminalActions();
  const { state } = useKlinechartsUI();
  const { focusedTarget, clearFocus, contextMenu, closeContextMenu } =
    useChartInteraction();
  const { activeTool, clearActiveTool } = useChartDrawingTools();
  const { isActive: measuring, cancelMeasure, clearResult } = useMeasure();
  const { isReplaying, stopReplay } = useReplay();

  const toCursor = useCallback(() => {
    selectCursorMode(state.chart, clearActiveTool);
  }, [state.chart, clearActiveTool]);

  return useCallback((): boolean => {
    if (closeAnyOpenModal()) return true;
    if (contextMenu) {
      closeContextMenu();
      return true;
    }
    if (activeTool || isChartOverlayDrawing(state.chart) || measuring) {
      if (measuring) {
        cancelMeasure();
        clearResult();
      }
      toCursor();
      clearFocus();
      return true;
    }
    if (focusedTarget) {
      clearFocus();
      toCursor();
      return true;
    }
    if (isReplaying) {
      stopReplay();
      toCursor();
      return true;
    }
    if (tradeMode) {
      disableTradeMode();
      toCursor();
      return true;
    }
    if (rrMode) {
      disableRRMode();
      toCursor();
      return true;
    }
    toCursor();
    return false;
  }, [
    closeAnyOpenModal,
    contextMenu,
    closeContextMenu,
    state.chart,
    activeTool,
    measuring,
    cancelMeasure,
    clearResult,
    toCursor,
    clearFocus,
    focusedTarget,
    isReplaying,
    stopReplay,
    tradeMode,
    disableTradeMode,
    rrMode,
    disableRRMode,
  ]);
}
