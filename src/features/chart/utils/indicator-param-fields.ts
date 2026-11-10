import type { Chart } from "@/core/klinechart";

export type IndicatorParamFieldKind = "number" | "enum";

export interface IndicatorParamEnumOption {
  value: number;
  labelKey: string;
}

export interface IndicatorParamField {
  label: string;
  defaultValue: number;
  kind?: IndicatorParamFieldKind;
  options?: IndicatorParamEnumOption[];
}

/** Merge library param schema with live calcParams from the chart instance. */
export function mergeIndicatorParamFields(
  schema: IndicatorParamField[],
  chart: Chart | null,
  indicatorName: string,
): IndicatorParamField[] {
  if (schema.length === 0) return schema;

  const live =
    chart?.getIndicators({ name: indicatorName })?.[0]?.calcParams ??
    chart?.getIndicators({ id: `main_${indicatorName}` })?.[0]?.calcParams ??
    chart?.getIndicators({ id: `sub_${indicatorName}` })?.[0]?.calcParams;

  if (!live?.length) return schema;

  return schema.map((field, index) => ({
    ...field,
    defaultValue:
      typeof live[index] === "number" && Number.isFinite(live[index])
        ? live[index]
        : field.defaultValue,
  }));
}
