/** Map app i18n language to klinecharts locale (only en-US / zh-CN are built in). */
export function chartLocale(lng: string): string {
  const code = String(lng).toLowerCase()
  return code.startsWith("zh") ? "zh-CN" : "en-US"
}
