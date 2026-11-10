import { useKlinechartsUISettings } from "@/core/headless";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { useChartCandleTypes } from "@/features/chart/hooks/use-chart-candle-types";
import { CandleTypeIcon } from "@/features/chart/components/chart-candle-type-icons";
import { LANGUAGE_OPTIONS } from "@/features/chart/components/ChartLanguageSwitcher";
import { useLanguage } from "@/hooks/use-language";
import type { SupportedLanguage } from "@/i18n";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function NativeSelect<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn(
        "h-8 rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
      )}
    >
      {options.map((o) => (
        <option key={o.key} value={o.key} className="bg-popover text-popover-foreground">
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const s = useKlinechartsUISettings();
  const { selectedType, candleTypes, setChartType } = useChartCandleTypes();
  const { t } = useChartT();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]" viewportClassName="pe-3">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.sec.display")}
          </h3>
          <Row label={t("settings.language")}>
            <NativeSelect
              value={currentLanguage}
              options={LANGUAGE_OPTIONS.map((l) => ({
                key: l.value,
                label: `${l.flag} ${l.label}`,
              }))}
              onChange={(v) => changeLanguage(v as SupportedLanguage)}
            />
          </Row>

          <Separator className="my-3" />
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.sec.candles")}
          </h3>
          <p className="mb-2 text-sm">{t("settings.type")}</p>
          <div className="grid grid-cols-3 gap-2 pb-1">
            {candleTypes.map((c) => {
              const active = selectedType === c.key;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setChartType(c.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-md border px-2 py-2 text-center transition-colors",
                    active
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <CandleTypeIcon type={c.key} className="size-5" />
                  <span className="text-[11px] leading-tight">{t(`candle.${c.key}`)}</span>
                </button>
              );
            })}
          </div>
          <Row label={t("settings.upColor")}>
            <input
              type="color"
              value={s.candleUpColor}
              onChange={(e) => s.setCandleUpColor(e.target.value)}
              className="h-7 w-12 cursor-pointer rounded border border-input bg-transparent"
            />
          </Row>
          <Row label={t("settings.downColor")}>
            <input
              type="color"
              value={s.candleDownColor}
              onChange={(e) => s.setCandleDownColor(e.target.value)}
              className="h-7 w-12 cursor-pointer rounded border border-input bg-transparent"
            />
          </Row>

          <Separator className="my-3" />
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.sec.priceAxis")}
          </h3>
          <Row label={t("settings.scaleType")}>
            <NativeSelect
              value={s.priceAxisType}
              options={s.priceAxisTypes.map((c) => ({ key: c.key, label: t(`axis.${c.key}`) }))}
              onChange={s.setPriceAxisType}
            />
          </Row>
          <Row label={t("settings.position")}>
            <NativeSelect
              value={s.yAxisPosition}
              options={s.yAxisPositions.map((c) => ({ key: c.key, label: t(`ypos.${c.key}`) }))}
              onChange={s.setYAxisPosition}
            />
          </Row>
          <Row label={t("settings.axisInside")}>
            <Switch checked={s.yAxisInside} onCheckedChange={s.setYAxisInside} />
          </Row>
          <Row label={t("settings.reverse")}>
            <Switch checked={s.reverseCoordinate} onCheckedChange={s.setReverseCoordinate} />
          </Row>

          <Separator className="my-3" />
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("settings.sec.display")}
          </h3>
          <Row label={t("settings.lastPrice")}>
            <Switch checked={s.showLastPrice} onCheckedChange={s.setShowLastPrice} />
          </Row>
          <Row label={t("settings.lastPriceLine")}>
            <Switch checked={s.showLastPriceLine} onCheckedChange={s.setShowLastPriceLine} />
          </Row>
          <Row label={t("settings.highLow")}>
            <Switch
              checked={s.showHighPrice && s.showLowPrice}
              onCheckedChange={(v) => {
                s.setShowHighPrice(v);
                s.setShowLowPrice(v);
              }}
            />
          </Row>
          <Row label={t("settings.grid")}>
            <Switch checked={s.showGrid} onCheckedChange={s.setShowGrid} />
          </Row>
          <Row label={t("settings.crosshair")}>
            <Switch checked={s.showCrosshair} onCheckedChange={s.setShowCrosshair} />
          </Row>
          <Row label={t("settings.timeAxis")}>
            <Switch checked={s.showTimeAxis} onCheckedChange={s.setShowTimeAxis} />
          </Row>
          <Row label={t("settings.candleTooltip")}>
            <Switch checked={s.showCandleTooltip} onCheckedChange={s.setShowCandleTooltip} />
          </Row>
          <Row label={t("settings.indicatorTooltip")}>
            <Switch
              checked={s.showIndicatorTooltip}
              onCheckedChange={s.setShowIndicatorTooltip}
            />
          </Row>
          <Row label={t("settings.tooltipRule")}>
            <NativeSelect
              value={s.tooltipShowRule}
              options={s.tooltipShowRules.map((c) => ({ key: c.key, label: t(`trule.${c.key}`) }))}
              onChange={s.setTooltipShowRule}
            />
          </Row>
        </ScrollArea>

        <div className="flex justify-end pt-1">
          <Button variant="outline" size="sm" onClick={s.resetToDefaults}>
            {t("settings.reset")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
