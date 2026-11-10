import { useEffect, useState } from "react";
import { useKlinechartsUI, useMeasure } from "@/core/headless";
import { CrosshairDataPanel } from "./CrosshairDataPanel";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { useChartInteraction } from "@/features/chart/context/chart-interaction-context";
import { useChartDrawingTools } from "@/features/chart/context/chart-drawing-tools-context";
import { cn, formatPercent } from "@/lib/utils";
import { drawToolLabel } from "@/features/chart/utils/draw-tool-label";

/** Live clock in the chart's selected timezone. */
function Clock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  let text: string;
  try {
    text = new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone,
    }).format(now);
  } catch {
    text = now.toLocaleTimeString("ru-RU");
  }
  return (
    <span className="font-mono tabular-nums" title={timeZone}>
      {text} <span className="text-muted-foreground/60">UTC</span>
    </span>
  );
}

/** Bottom status bar: symbol, period, crosshair OHLCV, active tool, hints, clock. */
export function StatusBar() {
  const { t } = useChartT();
  const { state } = useKlinechartsUI();
  const { activeTool, autoRetrigger } = useChartDrawingTools();
  const { isActive: measuring, result: measure } = useMeasure();
  const { focusedTarget } = useChartInteraction();

  return (
    <footer className="flex min-h-6 shrink-0 items-center gap-2 border-t border-border bg-card px-2 text-xs text-muted-foreground max-md:min-h-8 max-md:py-1">
      <span className="shrink-0 font-medium text-foreground max-md:hidden">
        {state.symbol?.ticker ?? "—"}
      </span>
      <span className="shrink-0 max-md:hidden">{state.period?.label ?? ""}</span>
      <div className="mx-1 hidden h-3 w-px shrink-0 bg-border max-md:hidden" />
      <CrosshairDataPanel />
      <div className="hidden flex-1 md:block" />

      {measure && (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 tabular-nums",
            measure.pricePercent >= 0 ? "bg-bull/15 text-bull" : "bg-bear/15 text-bear",
          )}
        >
          {formatPercent(measure.pricePercent)} · {measure.bars} {t("sb.bars")} ·{" "}
          {measure.priceDiff.toFixed(2)}
        </span>
      )}
      {measuring && !measure && (
        <span className="text-primary">{t("sb.measureHint")}</span>
      )}
      {activeTool ? (
        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
          {drawToolLabel(t, activeTool)}
          {autoRetrigger && t("sb.auto")}
        </span>
      ) : focusedTarget ? (
        <span className="shrink-0 text-muted-foreground/80 max-md:hidden">{t("sb.deleteHint")}</span>
      ) : (
        <span className="shrink-0 text-muted-foreground/60 max-md:hidden">{t("sb.escHint")}</span>
      )}

      <div className="mx-1 hidden h-3 w-px shrink-0 bg-border max-md:hidden" />
      <span className="shrink-0 max-md:hidden">
        <Clock timeZone={state.timezone} />
      </span>
    </footer>
  );
}
