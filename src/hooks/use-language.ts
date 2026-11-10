import { useTranslation } from "react-i18next"
import type { SupportedLanguage } from "@/i18n"

function resolveAppLanguage(lng: string | undefined): SupportedLanguage {
  const code = (lng ?? "vi").toLowerCase()
  if (code.startsWith("vi")) return "vi"
  if (code.startsWith("zh")) return "zh"
  return "en"
}

export function useLanguage() {
  const { i18n } = useTranslation()

  const changeLanguage = (lang: SupportedLanguage) => {
    void i18n.changeLanguage(lang)
    try {
      localStorage.setItem("chart_language", lang)
      localStorage.setItem("i18nextLng", lang)
    } catch {
      // ignore
    }
  }

  return {
    currentLanguage: resolveAppLanguage(i18n.language),
    changeLanguage,
  }
}
