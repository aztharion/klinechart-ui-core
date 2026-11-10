/** Localized label for an indicator calc param (from react-klinecharts-ui INDICATOR_PARAMS). */
export function indicatorParamLabel(
  t: (key: string) => string,
  indicatorName: string,
  labelKey: string,
): string {
  const specificKey = `ind.paramLabels.${indicatorName}.${labelKey}`;
  const specific = t(specificKey);
  if (specific !== specificKey) return specific;

  const genericKey = `ind.paramLabels.${labelKey}`;
  const generic = t(genericKey);
  if (generic !== genericKey) return generic;

  return labelKey;
}
