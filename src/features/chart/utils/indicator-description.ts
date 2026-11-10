type ChartTranslate = (
  key: string,
  params?: Record<string, string | number>,
) => string;

export function getIndicatorDescription(t: ChartTranslate, name: string): string {
  const key = `ind.descriptions.${name}`;
  const label = t(key);
  if (label !== key) return label;
  return t("ind.fallbackDesc", { name });
}
