import { useTranslation } from "react-i18next"

type TranslateFn = (
  key: string,
  params?: Record<string, string | number>
) => string

/** Loosely-typed chart translator (dynamic keys like candle.*, draw.cat.*). */
export function useChartT() {
  const { t, i18n } = useTranslation("chart")
  const translate: TranslateFn = (key, params) =>
    String(t(key as never, params as never))
  return { t: translate, i18n }
}
