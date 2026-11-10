import { Fragment, useRef, useState } from "react";
import { List, BookOpen, Info, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip";
import { ResizeHandle } from "@/components/ui/resize-handle";
import { usePersistentState } from "@/features/chart/hooks/use-persistent-state";
import { useIsChartPhoneLayout } from "@/features/chart/hooks/use-is-chart-phone-layout";
import { cn } from "@/lib/utils";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { WatchlistPanel } from "./WatchlistPanel";
import { OrderBookPanel } from "./OrderBookPanel";
import { SymbolInfoPanel } from "./SymbolInfoPanel";

const MIN_WIDTH = 220;
const MAX_WIDTH = 600;
const MIN_SECTION = 110;

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max));

interface SectionDef {
  id: string;
  label: string;
  icon: LucideIcon;
  render: () => React.ReactNode;
}

const SECTIONS: SectionDef[] = [
  {
    id: "watchlist",
    label: "dock.watchlist",
    icon: List,
    render: () => <WatchlistPanel />,
  },
  {
    id: "info",
    label: "dock.info",
    icon: Info,
    render: () => <SymbolInfoPanel />,
  },
  {
    id: "orderbook",
    label: "dock.orderbook",
    icon: BookOpen,
    render: () => <OrderBookPanel />,
  },
];

const DEFAULT_DOCK_OPEN: Record<string, boolean> = {
  watchlist: true,
  info: true,
  orderbook: true,
};

const PHONE_DOCK_OPEN: Record<string, boolean> = {
  watchlist: false,
  info: false,
  orderbook: false,
};

/**
 * Right-hand dock: a far-right activity bar toggles sections (watchlist /
 * symbol info / order book) that stack vertically in one panel. The panel
 * width and the split between consecutive sections are drag-resizable and
 * persisted.
 */
export function RightDock() {
  const { t } = useChartT();
  const isPhone = useIsChartPhoneLayout();
  const [desktopOpen, setDesktopOpen] = usePersistentState<Record<string, boolean>>(
    "dock.open.v2",
    DEFAULT_DOCK_OPEN,
  );
  const [phoneOpen, setPhoneOpen] = useState(PHONE_DOCK_OPEN);
  const open = isPhone ? phoneOpen : desktopOpen;
  const setOpen = isPhone ? setPhoneOpen : setDesktopOpen;
  const [width, setWidth] = usePersistentState("dock.width", 300);
  const [heights, setHeights] = usePersistentState<Record<string, number>>(
    "dock.heights",
    {},
  );
  const colRef = useRef<HTMLDivElement>(null);

  const openList = SECTIONS.filter((s) => open[s.id]);
  const panelOpen = openList.length > 0;

  const setHeight = (id: string, fn: (h: number) => number) =>
    setHeights((hs) => ({ ...hs, [id]: fn(hs[id] ?? 260) }));

  return (
    <div className="relative flex h-full shrink-0">
      {panelOpen && isPhone && (
        <button
          type="button"
          aria-label={t("dock.closePanels")}
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(PHONE_DOCK_OPEN)}
        />
      )}
      {panelOpen && (
        <>
          {!isPhone && (
            <ResizeHandle
              axis="x"
              onDelta={(d) =>
                setWidth((w) => clamp(w - d, MIN_WIDTH, MAX_WIDTH))
              }
            />
          )}
          <div
            ref={colRef}
            style={isPhone ? undefined : { width }}
            className={cn(
              "flex h-full flex-col overflow-hidden bg-card",
              isPhone &&
                "absolute top-0 right-10 z-50 w-[min(calc(100vw-2.5rem),320px)] border-s border-border shadow-lg",
            )}
          >
            {openList.map((s, i) => {
              const isLast = i === openList.length - 1;
              return (
                <Fragment key={s.id}>
                  <div
                    style={
                      isLast ? undefined : { height: heights[s.id] ?? 260 }
                    }
                    className={cn(
                      "min-h-0 overflow-hidden",
                      isLast ? "flex-1" : "shrink-0",
                      i > 0 && "border-t border-border",
                    )}
                  >
                    {s.render()}
                  </div>
                  {!isLast && !isPhone && (
                    <ResizeHandle
                      axis="y"
                      onDelta={(d) =>
                        setHeight(s.id, (h) => {
                          const max =
                            (colRef.current?.clientHeight ?? 700) - MIN_SECTION;
                          return clamp(h + d, MIN_SECTION, max);
                        })
                      }
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        </>
      )}

      <div className="relative z-50 flex w-10 shrink-0 flex-col items-center gap-0.5 border-s border-border bg-card py-1">
        {SECTIONS.map((s) => (
          <Tooltip key={s.id} content={t(s.label)} side="left">
            <Button
              variant={open[s.id] ? "secondary" : "ghost"}
              size="icon-sm"
              onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
            >
              <s.icon className="size-4" />
            </Button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
