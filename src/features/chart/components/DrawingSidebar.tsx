import { useState, useMemo } from "react";
import { useChartDrawingTools } from "@/features/chart/context/chart-drawing-tools-context";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { drawToolLabel } from "@/features/chart/utils/draw-tool-label";
import {
  TvCrosshairIcon,
  TvMagnetIcon,
  TvLockIcon,
  TvUnlockIcon,
  TvEyeIcon,
  TvEyeOffIcon,
  TvTrashIcon,
  TvFlyoutArrow,
  getTvToolIcon,
  TV_CATEGORY_ICONS,
  type TvIconProps,
} from "./tradingview-icons";
import type { FC } from "react";

const CATEGORY_KEYS: Record<string, string> = {
  singleLine: "draw.cat.singleLine",
  moreLine: "draw.cat.moreLine",
  polygon: "draw.cat.polygon",
  fibonacci: "draw.cat.fibonacci",
  wave: "draw.cat.wave",
  measure: "draw.cat.measure",
  position: "draw.cat.position",
  annotation: "draw.cat.annotation",
};

function DrawingCategoryPopover({
  label,
  hasActive,
  activeToolName,
  defaultIcon: DefaultIcon,
  tools,
  activeTool,
  onSelectTool,
  onTrigger,
  t,
}: {
  label: string;
  hasActive: boolean;
  activeToolName: string | null;
  defaultIcon: FC<TvIconProps>;
  tools: { name: string; localeKey: string }[];
  activeTool: string | null;
  onSelectTool: (name: string) => void;
  onTrigger: (open: () => void) => void;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(false);

  // If a tool in this category is currently active or was selected, show its specific icon
  const CurrentIcon = activeToolName ? getTvToolIcon(activeToolName) : DefaultIcon;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          onTrigger(() => setOpen(true));
        } else {
          setOpen(false);
        }
      }}
    >
      <Tooltip content={label} side="right" open={open ? false : undefined}>
        <PopoverTrigger asChild>
          <Button
            variant={hasActive ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "relative h-9 w-9 shrink-0 rounded-[6px] transition-colors",
              hasActive
                ? "bg-primary/15 text-primary hover:bg-primary/20"
                : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
            )}
          >
            <CurrentIcon className="size-[19px]" />
            <TvFlyoutArrow />
          </Button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-auto min-w-56 p-1.5 shadow-xl border-border/80 backdrop-blur-sm"
      >
        <div className="mb-1 px-2.5 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <ScrollArea className="max-h-[65vh]" viewportClassName="pe-1">
          <div className="flex flex-col gap-0.5">
            {tools.map((tool) => {
              const ToolIcon = getTvToolIcon(tool.name);
              const isSelected = activeTool === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => {
                    onSelectTool(tool.name);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-2.5 rounded-[5px] px-2.5 py-1.5 text-[13px] font-normal transition-colors text-left",
                    isSelected
                      ? "bg-primary/15 text-primary font-medium"
                      : "text-foreground/90 hover:bg-accent hover:text-foreground",
                  )}
                >
                  <ToolIcon className={cn("size-4 shrink-0", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <span className="truncate">{drawToolLabel(t, tool.name)}</span>
                </button>
              );
            })}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export function DrawingSidebar() {
  const { t } = useChartT();
  const {
    categories,
    activeTool,
    magnetMode,
    isLocked,
    isVisible,
    autoRetrigger,
    selectTool,
    clearActiveTool,
    setMagnetMode,
    toggleLock,
    toggleVisibility,
    removeAllDrawings,
    setAutoRetrigger,
  } = useChartDrawingTools();

  // Track the most recently selected tool per category so the button icon updates to that tool
  const [lastSelectedCategoryTool, setLastSelectedCategoryTool] = useState<Record<string, string>>({});

  const handleSelectTool = (categoryKey: string, toolName: string) => {
    setLastSelectedCategoryTool((prev) => ({ ...prev, [categoryKey]: toolName }));
    selectTool(toolName);
  };

  return (
    <aside
      aria-label="Drawing Tools Sidebar"
      className="flex w-12 select-none flex-col items-center gap-1 border-e border-border/80 bg-card/95 py-1.5 overflow-x-clip overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 [&::-webkit-scrollbar]:w-1"
    >
      {/* Cursor / Crosshair */}
      <Tooltip content={t("draw.cursor")} side="right">
        <Button
          variant={activeTool === null ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-[6px] transition-colors",
            activeTool === null
              ? "bg-primary/15 text-primary hover:bg-primary/20"
              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
          )}
          onClick={clearActiveTool}
        >
          <TvCrosshairIcon className="size-[19px]" />
        </Button>
      </Tooltip>

      <Separator className="my-0.5 w-6 shrink-0 opacity-60" />

      {/* Drawing Categories */}
      {categories
        .filter((category) => category.key !== "position")
        .map((category) => {
        const defaultIcon = TV_CATEGORY_ICONS[category.key] ?? TvCrosshairIcon;
        const label = CATEGORY_KEYS[category.key]
          ? t(CATEGORY_KEYS[category.key])
          : category.key;
        const activeInCat = category.tools.find((t) => t.name === activeTool);
        const hasActive = !!activeInCat;
        const displayedToolName = activeInCat?.name ?? lastSelectedCategoryTool[category.key] ?? category.tools[0]?.name ?? null;

        if (category.tools.length === 1) {
          const tool = category.tools[0];
          const SingleIcon = getTvToolIcon(tool.name);
          return (
            <Tooltip key={category.key} content={label} side="right">
              <Button
                variant={hasActive ? "secondary" : "ghost"}
                size="icon"
                className={cn(
                  "h-9 w-9 shrink-0 rounded-[6px] transition-colors",
                  hasActive
                    ? "bg-primary/15 text-primary hover:bg-primary/20"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
                )}
                onClick={() => handleSelectTool(category.key, tool.name)}
              >
                <SingleIcon className="size-[19px]" />
              </Button>
            </Tooltip>
          );
        }

        return (
          <DrawingCategoryPopover
            key={category.key}
            label={label}
            hasActive={hasActive}
            activeToolName={displayedToolName}
            defaultIcon={defaultIcon}
            tools={category.tools}
            activeTool={activeTool}
            onSelectTool={(name) => handleSelectTool(category.key, name)}
            onTrigger={(open) => open()}
            t={t}
          />
        );
      })}

      <div className="flex-1" />

      <Separator className="my-0.5 w-6 shrink-0 opacity-60" />

      {/* Magnet Mode */}
      <Tooltip
        content={t("draw.magnet", { mode: t(`magnet.${magnetMode}`) })}
        side="right"
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-[6px] transition-colors",
            magnetMode !== "normal"
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
          )}
          onClick={() =>
            setMagnetMode(
              magnetMode === "normal"
                ? "weak"
                : magnetMode === "weak"
                  ? "strong"
                  : "normal",
            )
          }
        >
          <TvMagnetIcon className="size-[19px]" />
        </Button>
      </Tooltip>

      {/* Stay in Drawing Mode (Auto Retrigger) */}
      <Tooltip
        content={autoRetrigger ? t("draw.autoOn") : t("draw.autoOff")}
        side="right"
      >
        <Button
          variant={autoRetrigger ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-[6px] transition-colors",
            autoRetrigger
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
          )}
          onClick={() => setAutoRetrigger(!autoRetrigger)}
        >
          <Repeat className="size-[18px]" />
        </Button>
      </Tooltip>

      {/* Lock All Drawings */}
      <Tooltip
        content={isLocked ? t("draw.unlock") : t("draw.lock")}
        side="right"
      >
        <Button
          variant={isLocked ? "secondary" : "ghost"}
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-[6px] transition-colors",
            isLocked
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
          )}
          onClick={toggleLock}
        >
          {isLocked ? (
            <TvLockIcon className="size-[19px]" />
          ) : (
            <TvUnlockIcon className="size-[19px]" />
          )}
        </Button>
      </Tooltip>

      {/* Hide / Show All Drawings */}
      <Tooltip
        content={isVisible ? t("draw.hide") : t("draw.show")}
        side="right"
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 shrink-0 rounded-[6px] transition-colors",
            !isVisible
              ? "bg-destructive/15 text-destructive"
              : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
          )}
          onClick={toggleVisibility}
        >
          {isVisible ? (
            <TvEyeIcon className="size-[19px]" />
          ) : (
            <TvEyeOffIcon className="size-[19px]" />
          )}
        </Button>
      </Tooltip>

      {/* Remove All Drawings */}
      <Tooltip content={t("draw.removeAll")} side="right">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-[6px] text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive"
          onClick={removeAllDrawings}
        >
          <TvTrashIcon className="size-[19px]" />
        </Button>
      </Tooltip>
    </aside>
  );
}
