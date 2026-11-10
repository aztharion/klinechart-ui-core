import { useEffect, useLayoutEffect, useState } from "react";
import { Lock, LockOpen, Settings2, Trash2 } from "lucide-react";
import { useIndicators, useKlinechartsUI } from "@/core/headless";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { useChartInteraction } from "@/features/chart/context/chart-interaction-context";
import { IndicatorParamsPopover } from "@/features/chart/components/indicator-params-popover";
import { drawToolLabel } from "@/features/chart/utils/draw-tool-label";
import {
  ChartContextMenuItem,
  ChartContextMenuSeparator,
  ChartFloatingContextMenu,
  clampMenuPosition,
} from "@/features/chart/components/chart-context-menu";

/** Floating context menu for a focused chart object (overlay or indicator). */
export function ChartObjectContextMenu() {
  const { t } = useChartT();
  const { state } = useKlinechartsUI();
  const ind = useIndicators();
  const {
    contextMenu,
    closeContextMenu,
    deleteFocusedTarget,
    toggleOverlayLock,
    openIndicatorEdit,
    indicatorEdit,
    closeIndicatorEdit,
  } = useChartInteraction();

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!contextMenu) return;
    const onPointerDown = (e: PointerEvent) => {
      const menu = document.getElementById("chart-object-context-menu");
      if (menu?.contains(e.target as Node)) return;
      closeContextMenu();
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [contextMenu, closeContextMenu]);

  useLayoutEffect(() => {
    if (!contextMenu) {
      setPosition(null);
      return;
    }
    const el = document.getElementById("chart-object-context-menu");
    if (!el) {
      setPosition({ x: contextMenu.x, y: contextMenu.y });
      return;
    }
    const rect = el.getBoundingClientRect();
    setPosition(clampMenuPosition(contextMenu.x, contextMenu.y, rect.width, rect.height));
  }, [contextMenu]);

  const overlayLocked =
    contextMenu?.target.kind === "overlay"
      ? (state.chart?.getOverlays?.({ id: contextMenu.target.id })?.[0]?.lock ?? false)
      : false;

  if (!contextMenu && !indicatorEdit) return null;

  const menuTarget = contextMenu?.target;
  const menuTitle =
    menuTarget?.kind === "indicator"
      ? t("ctx.titleIndicator", { name: menuTarget.name })
      : menuTarget?.kind === "overlay"
        ? t("ctx.titleDrawing", {
            name: drawToolLabel(t, menuTarget.name),
          })
        : undefined;

  const coords = position ?? (contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null);

  return (
    <>
      {contextMenu && menuTarget && coords && (
        <ChartFloatingContextMenu
          id="chart-object-context-menu"
          x={coords.x}
          y={coords.y}
          title={menuTitle}
        >
          {menuTarget.kind === "indicator" && (
            <ChartContextMenuItem
              icon={Settings2}
              label={t("ctx.settings")}
              onClick={() =>
                openIndicatorEdit({
                  name: menuTarget.name,
                  paneId: menuTarget.paneId,
                  isMain: menuTarget.isMain,
                })
              }
            />
          )}
          {menuTarget.kind === "overlay" && (
            <ChartContextMenuItem
              icon={overlayLocked ? LockOpen : Lock}
              label={overlayLocked ? t("ctx.unlock") : t("ctx.lock")}
              onClick={() => toggleOverlayLock(menuTarget.id)}
            />
          )}
          <ChartContextMenuSeparator />
          <ChartContextMenuItem
            icon={Trash2}
            label={t("ctx.remove")}
            shortcut={t("ctx.deleteKey")}
            destructive
            onClick={() => deleteFocusedTarget()}
          />
        </ChartFloatingContextMenu>
      )}

      {indicatorEdit && (
        <IndicatorParamsPopover
          name={indicatorEdit.name}
          paneId={indicatorEdit.paneId}
          hideTrigger
          open
          onOpenChange={(open) => {
            if (!open) closeIndicatorEdit();
          }}
          onApply={(paneId, values) => {
            ind.updateIndicatorParams(indicatorEdit.name, paneId, values);
          }}
        />
      )}
    </>
  );
}
