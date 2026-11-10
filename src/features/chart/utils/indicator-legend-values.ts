import type { Chart } from "@/core/klinechart";
import { getVpvrSnapshot } from "@/features/chart/lib/volume-profile/vpvr-indicator";
import { VPVR_INDICATOR_NAME } from "@/features/chart/lib/volume-profile/types";

const DEFAULT_LINE_COLORS = ["#FF9600", "#935EBD", "#2563EB", "#E11D74", "#01C5C4"];

export interface IndicatorLegendValue {
  label: string;
  value: string;
  color: string;
}

export interface IndicatorLegendDisplay {
  title: string;
  paramText: string;
  values: IndicatorLegendValue[];
}

function resolveIndicator(chart: Chart, name: string, isMain: boolean) {
  const id = isMain ? `main_${name}` : `sub_${name}`;
  return chart.getIndicators({ id })[0] ?? chart.getIndicators({ name })[0];
}

function figureColor(
  indicator: ReturnType<Chart["getIndicators"]>[number],
  figure: { type?: string },
  index: number,
): string {
  const figureType = figure.type ?? "line";
  const styles = indicator.styles;
  if (figureType === "line") {
    const line = styles?.lines?.[index];
    if (line && typeof line.color === "string") return line.color;
  }
  if (figureType === "circle") {
    const circle = styles?.circles?.[index];
    if (circle && typeof circle.upColor === "string") return circle.upColor;
  }
  if (figureType === "bar") {
    const bar = styles?.bars?.[index];
    if (bar && typeof bar.upColor === "string") return bar.upColor;
  }
  return DEFAULT_LINE_COLORS[index % DEFAULT_LINE_COLORS.length];
}

function formatValue(value: number, precision: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: Math.min(precision, 8),
    maximumFractionDigits: precision,
  });
}

export function buildIndicatorLegendDisplay(
  chart: Chart | null,
  name: string,
  isMain: boolean,
  dataIndex: number | null,
): IndicatorLegendDisplay {
  if (!chart) {
    return { title: name, paramText: "", values: [] };
  }

  const indicator = resolveIndicator(chart, name, isMain);
  if (!indicator) {
    return { title: name, paramText: "", values: [] };
  }

  const paramText =
    indicator.calcParams.length > 0 ? `(${indicator.calcParams.join(",")})` : "";

  if (!indicator.visible) {
    return { title: indicator.shortName || name, paramText, values: [] };
  }

  if (name === VPVR_INDICATOR_NAME) {
    const snapshot = getVpvrSnapshot(chart);
    if (!snapshot) {
      return { title: indicator.shortName || name, paramText, values: [] };
    }

    const precision = chart.getSymbol()?.pricePrecision ?? indicator.precision ?? 2;
    const fmt = (value: number) => formatValue(value, precision);
    return {
      title: indicator.shortName || name,
      paramText,
      values: [
        { label: "POC", value: fmt(snapshot.pocPrice), color: "#F23645" },
        { label: "VAH", value: fmt(snapshot.vahPrice), color: "#2962FF" },
        { label: "VAL", value: fmt(snapshot.valPrice), color: "#2962FF" },
      ],
    };
  }

  const index = dataIndex ?? Math.max(chart.getDataList().length - 1, 0);
  const bar = indicator.result[index] as Record<string, number> | undefined;
  if (!bar) {
    return { title: indicator.shortName || name, paramText, values: [] };
  }

  const values: IndicatorLegendValue[] = [];
  let figureIndex = 0;

  for (const figure of indicator.figures) {
    if (typeof figure.title !== "string" || !figure.key) continue;
    const raw = bar[figure.key];
    if (typeof raw !== "number" || Number.isNaN(raw)) continue;

    values.push({
      label: figure.title.trim().replace(/:$/, ""),
      value: formatValue(raw, indicator.precision),
      color: figureColor(indicator, figure, figureIndex),
    });
    figureIndex += 1;
  }

  return { title: indicator.shortName || name, paramText, values };
}
