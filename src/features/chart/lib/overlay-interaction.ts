import type { Chart } from "@/core/klinechart";

export type OverlayInteractionHandlers = {
  onFocusOverlay: (overlay: { id: string; name: string; paneId: string }) => void;
  onOpenOverlayMenu: (
    overlay: { id: string; name: string; paneId: string },
    clientX: number,
    clientY: number,
  ) => void;
  onClearFocusIfOverlay: (overlayId: string) => void;
};

/** Attach TradingView-style interaction handlers to every chart overlay. */
export function installOverlayInteraction(
  chart: Chart,
  handlers: OverlayInteractionHandlers,
): () => void {
  const patched = new Set<string>();

  const patchOverlay = (overlay: { id: string; name: string; paneId: string }) => {
    if (patched.has(overlay.id)) return;
    patched.add(overlay.id);

    chart.overrideOverlay({
      id: overlay.id,
      onClick: () => {
        handlers.onFocusOverlay({
          id: overlay.id,
          name: overlay.name,
          paneId: overlay.paneId,
        });
      },
      onSelected: () => {
        handlers.onFocusOverlay({
          id: overlay.id,
          name: overlay.name,
          paneId: overlay.paneId,
        });
      },
      onDeselected: () => {
        handlers.onClearFocusIfOverlay(overlay.id);
      },
      onRightClick: (event) => {
        event.preventDefault?.();
        const clientX = event.pageX ?? event.x ?? 0;
        const clientY = event.pageY ?? event.y ?? 0;
        handlers.onOpenOverlayMenu(
          { id: overlay.id, name: overlay.name, paneId: overlay.paneId },
          clientX,
          clientY,
        );
      },
    });
  };

  const sync = () => {
    for (const overlay of chart.getOverlays?.() ?? []) {
      patchOverlay(overlay);
    }
  };

  sync();
  const timer = window.setInterval(sync, 250);

  return () => {
    window.clearInterval(timer);
    patched.clear();
  };
}
