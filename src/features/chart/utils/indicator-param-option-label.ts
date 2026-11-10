/** Localized label for an enum option on a custom indicator param. */
export function indicatorParamOptionLabel(
  t: (key: string) => string,
  indicatorName: string,
  labelKey: string,
): string {
  const specificKey = `ind.paramOptions.${indicatorName}.${labelKey}`;
  const specific = t(specificKey);
  if (specific !== specificKey) return specific;
  return labelKey;
}
