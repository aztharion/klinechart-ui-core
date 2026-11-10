import type { IndicatorParamField } from "@/features/chart/utils/indicator-param-fields";
import { VPVR_INDICATOR_NAME } from "@/features/chart/lib/volume-profile/types";

export const CUSTOM_MAIN_INDICATORS = [VPVR_INDICATOR_NAME] as const;

export type CustomMainIndicatorName = (typeof CUSTOM_MAIN_INDICATORS)[number];

export function isCustomMainIndicator(name: string): name is CustomMainIndicatorName {
  return (CUSTOM_MAIN_INDICATORS as readonly string[]).includes(name);
}

export const CUSTOM_INDICATOR_PARAMS: Record<string, IndicatorParamField[]> = {
  [VPVR_INDICATOR_NAME]: [
    { label: "params_1", defaultValue: 48 },
    { label: "params_2", defaultValue: 70 },
    {
      label: "params_3",
      defaultValue: 0,
      kind: "enum",
      options: [
        { value: 0, labelKey: "placementRight" },
        { value: 1, labelKey: "placementLeft" },
      ],
    },
    {
      label: "params_4",
      defaultValue: 0,
      kind: "enum",
      options: [
        { value: 0, labelKey: "volumeTotal" },
        { value: 1, labelKey: "volumeUpDown" },
      ],
    },
  ],
};

export function getCustomIndicatorParams(name: string): IndicatorParamField[] {
  return CUSTOM_INDICATOR_PARAMS[name] ?? [];
}
