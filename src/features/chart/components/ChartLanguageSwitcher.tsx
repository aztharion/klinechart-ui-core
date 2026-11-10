import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useChartT } from "@/features/chart/hooks/use-chart-t"
import { useLanguage } from "@/hooks/use-language"
import type { SupportedLanguage } from "@/i18n"
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip"

const LANGUAGE_OPTIONS: {
  value: SupportedLanguage
  label: string
  flag: string
}[] = [
  { value: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "zh", label: "简体中文", flag: "🇨🇳" },
]

export function ChartLanguageSwitcher() {
  const { t } = useChartT()
  const { currentLanguage, changeLanguage } = useLanguage()
  const current =
    LANGUAGE_OPTIONS.find((l) => l.value === currentLanguage) ??
    LANGUAGE_OPTIONS[0]

  return (
    <DropdownMenu>
      <Tooltip content={t("settings.language")}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 px-2">
            <Languages className="size-4" />
            <span className="hidden max-lg:inline">{current.flag}</span>
            <span className="hidden xl:inline">{current.label}</span>
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align="end" className="w-40">
        {LANGUAGE_OPTIONS.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            onClick={() => changeLanguage(lang.value)}
            className={
              currentLanguage === lang.value ? "font-medium text-primary" : ""
            }
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { LANGUAGE_OPTIONS }
