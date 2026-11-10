import i18n from "i18next"
import Backend from "i18next-http-backend"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

export const SUPPORTED_LANGUAGES = ["vi", "en", "zh"] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const NAMESPACES = ["chart", "common"] as const

function syncDocumentLang(lng: string) {
  if (typeof document === "undefined") return
  const code = String(lng).toLowerCase()
  if (code.startsWith("vi")) {
    document.documentElement.lang = "vi"
  } else if (code.startsWith("zh")) {
    document.documentElement.lang = "zh"
  } else {
    document.documentElement.lang = "en"
  }
}

i18n.on("initialized", () => {
  syncDocumentLang(i18n.language)
})
i18n.on("languageChanged", (lng) => {
  syncDocumentLang(lng)
})

void i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "vi",
    supportedLngs: SUPPORTED_LANGUAGES,
    ns: NAMESPACES,
    defaultNS: "chart",
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "chart_language",
      caches: ["localStorage"],
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
