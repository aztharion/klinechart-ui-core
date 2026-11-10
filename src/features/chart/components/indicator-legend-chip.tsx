import { Eye, EyeOff, X } from "lucide-react";
import type { Chart } from "@/core/klinechart";
import { useIndicators } from "@/core/headless";
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip";
import { IndicatorParamsPopover } from "@/features/chart/components/indicator-params-popover";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { useIsChartPhoneLayout } from "@/features/chart/hooks/use-is-chart-phone-layout";
import { useChartInteraction } from "@/features/chart/context/chart-interaction-context";
import { buildIndicatorLegendDisplay } from "@/features/chart/utils/indicator-legend-values";
import { getCustomIndicatorParams } from "@/features/chart/utils/custom-indicators";
import { cn } from "@/lib/utils";

interface IndicatorLegendChipProps {
  name: string;
  paneId: string;
  isMain: boolean;
  chart: Chart | null;
  dataIndex: number | null;
}

/** TradingView-style inline legend: canvas-matched text + hover eye / settings / remove. */
export function IndicatorLegendChip({
  name,
  paneId,
  isMain,
  chart,
  dataIndex,
}: IndicatorLegendChipProps) {
  const { t } = useChartT();
  const isPhone = useIsChartPhoneLayout();
  const ind = useIndicators();
  const { focusTarget, isFocused, openContextMenu } = useChartInteraction();

  const target = { kind: "indicator" as const, name, paneId, isMain };
  const focused = isFocused(target);
  const visible = ind.isIndicatorVisible(name, isMain);
  const hasParams =
    ind.getIndicatorParams(name).length > 0 || getCustomIndicatorParams(name).length > 0;
  const display = buildIndicatorLegendDisplay(chart, name, isMain, dataIndex);
  const showControls = focused || !visible;
  const showValues = !isPhone || focused;

  const toggleVisible = (e: React.MouseEvent) => {
    e.stopPropagation();
    ind.setIndicatorVisible(name, isMain, !visible);
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMain) ind.removeMainIndicator(name);
    else ind.removeSubIndicator(name);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "group pointer-events-auto relative max-w-full cursor-default",
        isPhone ? "min-h-3 leading-3" : "h-3",
        focused && "rounded-sm ring-1 ring-primary/30",
        !visible && "opacity-80",
      )}
      onClick={() => focusTarget(target)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          focusTarget(target);
        }
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        focusTarget(target);
        openContextMenu(e.clientX, e.clientY, target);
      }}
    >
      <div
        className={cn(
          "flex max-w-full items-center gap-x-1 pr-0.5",
          showValues
            ? isPhone
              ? "flex-wrap gap-y-0.5"
              : "h-3 flex-nowrap overflow-hidden"
            : "h-3 flex-nowrap overflow-hidden",
        )}
      >
        <span
          className={cn(
            "chart-pane-legend-label shrink-0",
            !visible && "line-through decoration-[#76808F]/60",
          )}
        >
          {display.title}
          {display.paramText}
        </span>

        {showValues &&
          display.values.map((item) => (
            <span
              key={item.label}
              className={cn(
                "shrink-0 whitespace-nowrap",
                !visible && "line-through opacity-50",
              )}
              style={{ color: visible ? item.color : undefined }}
            >
              {item.label}: {item.value}
            </span>
          ))}
      </div>

      {/* Float on hover — avoids flex-wrap pushing controls to a 2nd line (uneven row gaps). */}
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 left-full z-10 flex -translate-y-1/2 items-center gap-px pl-0.5 opacity-0 transition-opacity duration-100",
          "group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100",
          showControls && "pointer-events-auto opacity-100",
        )}
      >
        <Tooltip content={visible ? t("ind.hide") : t("ind.show")}>
          <button
            type="button"
            className="flex size-3.5 items-center justify-center rounded-sm bg-background/80 text-[#76808F] hover:bg-accent/60 hover:text-foreground dark:text-[#929AA5]"
            aria-label={visible ? t("ind.hide") : t("ind.show")}
            onClick={toggleVisible}
          >
            {visible ? <Eye className="size-2.5" /> : <EyeOff className="size-2.5" />}
          </button>
        </Tooltip>

        {hasParams ? (
          <IndicatorParamsPopover
            name={name}
            paneId={paneId}
            triggerClassName="size-3.5 bg-background/80 hover:bg-accent/60"
            onApply={(pid, values) => ind.updateIndicatorParams(name, pid, values)}
          />
        ) : null}

        <Tooltip content={t("ind.remove")}>
          <button
            type="button"
            className="flex size-3.5 items-center justify-center rounded-sm bg-background/80 text-[#76808F] hover:bg-destructive/10 hover:text-destructive dark:text-[#929AA5]"
            aria-label={t("ind.remove")}
            onClick={remove}
          >
            <X className="size-2.5" />
          </button>
        </Tooltip>
      </span>
    </div>
  );
}
