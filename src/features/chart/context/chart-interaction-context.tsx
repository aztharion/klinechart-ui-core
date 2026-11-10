import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useIndicators, useKlinechartsUI } from "@/core/headless";
import { installOverlayInteraction } from "@/features/chart/lib/overlay-interaction";
import {
  focusTargetKey,
  type ChartContextMenuState,
  type ChartFocusTarget,
} from "@/features/chart/types/chart-focus-target";

interface IndicatorEditRequest {
  name: string;
  paneId: string;
  isMain: boolean;
}

interface ChartInteractionValue {
  focusedTarget: ChartFocusTarget | null;
  focusTarget: (target: ChartFocusTarget) => void;
  clearFocus: () => void;
  isFocused: (target: ChartFocusTarget) => boolean;
  contextMenu: ChartContextMenuState;
  openContextMenu: (x: number, y: number, target: ChartFocusTarget) => void;
  closeContextMenu: () => void;
  deleteFocusedTarget: () => void;
  toggleOverlayLock: (overlayId: string) => void;
  indicatorEdit: IndicatorEditRequest | null;
  openIndicatorEdit: (request: IndicatorEditRequest) => void;
  closeIndicatorEdit: () => void;
}

const ChartInteractionContext = createContext<ChartInteractionValue | null>(null);

export function useChartInteraction(): ChartInteractionValue {
  const ctx = useContext(ChartInteractionContext);
  if (!ctx) {
    throw new Error("useChartInteraction must be used within ChartInteractionProvider");
  }
  return ctx;
}

export function ChartInteractionProvider({ children }: { children: ReactNode }) {
  const { state } = useKlinechartsUI();
  const indicators = useIndicators();
  const [focusedTarget, setFocusedTarget] = useState<ChartFocusTarget | null>(null);
  const [contextMenu, setContextMenu] = useState<ChartContextMenuState>(null);
  const [indicatorEdit, setIndicatorEdit] = useState<IndicatorEditRequest | null>(null);
  const focusedKeyRef = useRef<string | null>(null);

  const focusTarget = useCallback((target: ChartFocusTarget) => {
    focusedKeyRef.current = focusTargetKey(target);
    setFocusedTarget(target);
  }, []);

  const clearFocus = useCallback(() => {
    focusedKeyRef.current = null;
    setFocusedTarget(null);
  }, []);

  const isFocused = useCallback(
    (target: ChartFocusTarget) => focusedKeyRef.current === focusTargetKey(target),
    [],
  );

  const openContextMenu = useCallback(
    (x: number, y: number, target: ChartFocusTarget) => {
      focusTarget(target);
      setContextMenu({ x, y, target });
    },
    [focusTarget],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const deleteFocusedTarget = useCallback(() => {
    const chart = state.chart;
    const target = focusedTarget;
    if (!target) return;

    if (target.kind === "overlay") {
      chart?.removeOverlay?.({ id: target.id });
    } else if (target.isMain) {
      indicators.removeMainIndicator(target.name);
    } else {
      indicators.removeSubIndicator(target.name);
    }

    clearFocus();
    closeContextMenu();
  }, [state.chart, focusedTarget, indicators, clearFocus, closeContextMenu]);

  const toggleOverlayLock = useCallback(
    (overlayId: string) => {
      const chart = state.chart;
      if (!chart) return;
      const overlay = chart.getOverlays?.({ id: overlayId })?.[0];
      if (!overlay) return;
      chart.overrideOverlay({ id: overlayId, lock: !overlay.lock });
      closeContextMenu();
    },
    [state.chart, closeContextMenu],
  );

  const openIndicatorEdit = useCallback(
    (request: IndicatorEditRequest) => {
      closeContextMenu();
      setIndicatorEdit(request);
    },
    [closeContextMenu],
  );

  const closeIndicatorEdit = useCallback(() => {
    setIndicatorEdit(null);
  }, []);

  const handlersRef = useRef({
    focusTarget,
    openContextMenu,
    clearFocus,
  });
  handlersRef.current = { focusTarget, openContextMenu, clearFocus };

  useEffect(() => {
    const chart = state.chart;
    if (!chart) return;

    const onCandleClick = () => {
      handlersRef.current.clearFocus();
    };
    chart.subscribeAction?.("onCandleBarClick", onCandleClick);

    const cleanupOverlays = installOverlayInteraction(chart, {
      onFocusOverlay: (overlay) => {
        handlersRef.current.focusTarget({
          kind: "overlay",
          id: overlay.id,
          name: overlay.name,
          paneId: overlay.paneId,
        });
      },
      onOpenOverlayMenu: (overlay, clientX, clientY) => {
        handlersRef.current.openContextMenu(clientX, clientY, {
          kind: "overlay",
          id: overlay.id,
          name: overlay.name,
          paneId: overlay.paneId,
        });
      },
      onClearFocusIfOverlay: (overlayId) => {
        if (focusedKeyRef.current === `overlay:${overlayId}`) {
          handlersRef.current.clearFocus();
        }
      },
    });

    return () => {
      chart.unsubscribeAction?.("onCandleBarClick", onCandleClick);
      cleanupOverlays();
    };
  }, [state.chart]);

  const value = useMemo<ChartInteractionValue>(
    () => ({
      focusedTarget,
      focusTarget,
      clearFocus,
      isFocused,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      deleteFocusedTarget,
      toggleOverlayLock,
      indicatorEdit,
      openIndicatorEdit,
      closeIndicatorEdit,
    }),
    [
      focusedTarget,
      focusTarget,
      clearFocus,
      isFocused,
      contextMenu,
      openContextMenu,
      closeContextMenu,
      deleteFocusedTarget,
      toggleOverlayLock,
      indicatorEdit,
      openIndicatorEdit,
      closeIndicatorEdit,
    ],
  );

  return (
    <ChartInteractionContext.Provider value={value}>{children}</ChartInteractionContext.Provider>
  );
}
