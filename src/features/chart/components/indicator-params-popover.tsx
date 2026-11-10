import { useEffect, useMemo, useState } from "react";
import { Settings2 } from "lucide-react";
import { useIndicators, useKlinechartsUI } from "@/core/headless";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useChartT } from "@/features/chart/hooks/use-chart-t";
import { savePersistedIndicatorParams } from "@/features/chart/utils/chart-indicator-persistence";
import { getIndicatorDescription } from "@/features/chart/utils/indicator-description";
import { indicatorParamLabel } from "@/features/chart/utils/indicator-param-label";
import { mergeIndicatorParamFields } from "@/features/chart/utils/indicator-param-fields";
import { getCustomIndicatorParams } from "@/features/chart/utils/custom-indicators";
import { indicatorParamOptionLabel } from "@/features/chart/utils/indicator-param-option-label";
import { cn } from "@/lib/utils";

function readLiveCalcParamsKey(
  chart: ReturnType<typeof useKlinechartsUI>["state"]["chart"],
  name: string,
): string {
  const live =
    chart?.getIndicators({ name })?.[0]?.calcParams ??
    chart?.getIndicators({ id: `main_${name}` })?.[0]?.calcParams ??
    chart?.getIndicators({ id: `sub_${name}` })?.[0]?.calcParams;
  return live?.join(",") ?? "";
}

export function IndicatorParamsPopover({
  name,
  paneId,
  onApply,
  triggerClassName,
  hideTrigger = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  name: string;
  paneId: string;
  onApply: (paneId: string, values: number[]) => void;
  triggerClassName?: string;
  hideTrigger?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useChartT();
  const { getIndicatorParams } = useIndicators();
  const { state } = useKlinechartsUI();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled
    ? (value: boolean) => controlledOnOpenChange?.(value)
    : setInternalOpen;
  const calcParamsKey = useMemo(
    () => readLiveCalcParamsKey(state.chart, name),
    [name, state.chart, state.mainIndicators, state.subIndicators],
  );
  const fields = useMemo(() => {
    const schema = getIndicatorParams(name);
    const resolved = schema.length > 0 ? schema : getCustomIndicatorParams(name);
    return mergeIndicatorParamFields(resolved, state.chart, name);
  }, [getIndicatorParams, name, state.chart, calcParamsKey]);
  const [values, setValues] = useState<number[]>([]);
  const description = getIndicatorDescription(t, name);
  const locationLabel = paneId === "candle_pane" ? t("ind.onChart") : t("ind.inPanes");

  useEffect(() => {
    if (open && fields.length > 0) {
      setValues(fields.map((p) => p.defaultValue));
    }
  }, [open, fields]);

  if (fields.length === 0) {
    return null;
  }

  const openEditor = () => {
    setValues(fields.map((p) => p.defaultValue));
    setOpen(true);
  };

  const handleApply = () => {
    onApply(paneId, values);
    savePersistedIndicatorParams(name, values);
    setOpen(false);
  };

  return (
    <>
      {!hideTrigger && (
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("size-6", triggerClassName)}
          aria-label={t("ind.paramsAria", { name })}
          onClick={openEditor}
        >
          <Settings2 className="size-3.5" />
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-md">
          <div className="border-b border-border/60 bg-muted/30 px-6 py-5">
            <DialogHeader className="gap-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Settings2 className="size-5" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <DialogTitle className="text-xl tracking-tight">{name}</DialogTitle>
                    <Badge variant="secondary" className="font-normal">
                      {t("ind.editParams")}
                    </Badge>
                  </div>
                  <Badge variant="outline" className="font-normal">
                    {locationLabel}
                  </Badge>
                  <DialogDescription className="line-clamp-3 text-sm leading-relaxed">
                    {description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            {fields.map((p, i) => (
              <label
                key={`${p.label}-${i}`}
                className="flex items-center justify-between gap-4 text-sm"
              >
                <span className="min-w-0 flex-1 text-muted-foreground">
                  {indicatorParamLabel(t, name, p.label)}
                </span>
                {p.kind === "enum" && p.options?.length ? (
                  <select
                    value={values[i] ?? p.defaultValue}
                    onChange={(e) => {
                      const next = [...values];
                      next[i] = Number(e.target.value);
                      setValues(next);
                    }}
                    className="h-9 w-36 shrink-0 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {p.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {indicatorParamOptionLabel(t, name, opt.labelKey)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    type="number"
                    value={values[i] ?? p.defaultValue}
                    onChange={(e) => {
                      const next = [...values];
                      next[i] = Number(e.target.value);
                      setValues(next);
                    }}
                    className="h-9 w-28 shrink-0 tabular-nums"
                  />
                )}
              </label>
            ))}
          </div>

          <DialogFooter className="border-t border-border/60 px-6 py-4 sm:justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t("ind.cancel")}
            </Button>
            <Button onClick={handleApply}>{t("ind.apply")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
