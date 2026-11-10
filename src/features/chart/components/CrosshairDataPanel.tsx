import { useCrosshair, useKlinechartsUI } from "@/core/headless";
import { useIsChartPhoneLayout } from "@/features/chart/hooks/use-is-chart-phone-layout";
import { cn, formatCompact } from "@/lib/utils";

function Field({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className="text-muted-foreground/70">{label}</span>
      <span className={cn("tabular-nums", tone)}>{value}</span>
    </span>
  );
}

function formatBarTime(timestamp: number, timezone: string): string {
  try {
    return new Intl.DateTimeFormat("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timezone,
    }).format(new Date(timestamp));
  } catch {
    return new Date(timestamp).toLocaleString();
  }
}

/** OHLCV readout for the bar under the crosshair. */
export function CrosshairDataPanel() {
  const { barData } = useCrosshair();
  const { state } = useKlinechartsUI();
  const isPhone = useIsChartPhoneLayout();

  if (!barData) return null;

  const up = barData.close >= barData.open;
  const tone = up ? "text-bull" : "text-bear";
  const time = formatBarTime(barData.timestamp, state.timezone);

  if (isPhone) {
    return (
      <div className="flex min-w-0 flex-1 items-center overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex shrink-0 items-center gap-2 tabular-nums">
          <Field label="Time" value={time} tone="text-foreground" />
          <Field label="O" value={barData.open.toString()} tone={tone} />
          <Field label="H" value={barData.high.toString()} tone={tone} />
          <Field label="L" value={barData.low.toString()} tone={tone} />
          <Field label="C" value={barData.close.toString()} tone={tone} />
          <Field label="V" value={formatCompact(barData.volume)} tone={tone} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 tabular-nums">
      <Field label="O" value={barData.open.toString()} tone={tone} />
      <Field label="H" value={barData.high.toString()} tone={tone} />
      <Field label="L" value={barData.low.toString()} tone={tone} />
      <Field label="C" value={barData.close.toString()} tone={tone} />
      <Field label="V" value={formatCompact(barData.volume)} tone={tone} />
      <span className={cn("tabular-nums", tone)}>
        {barData.change >= 0 ? "+" : ""}
        {barData.change.toFixed(2)} ({barData.changePercent >= 0 ? "+" : ""}
        {barData.changePercent.toFixed(2)}%)
      </span>
    </div>
  );
}
