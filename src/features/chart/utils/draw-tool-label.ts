import { DRAWING_CATEGORIES } from "@/core/headless"
import { FRVP_OVERLAY_NAME } from "@/features/chart/lib/volume-profile/frvp-overlay"

const TOOL_LOCALE_BY_NAME = Object.fromEntries(
  DRAWING_CATEGORIES.flatMap((cat) =>
    cat.tools.map((tool) => [tool.name, tool.localeKey]),
  ),
) as Record<string, string>

TOOL_LOCALE_BY_NAME[FRVP_OVERLAY_NAME] = "fixedRangeVolumeProfile"

function formatToolName(name: string) {
  return name.replace(/([A-Z])/g, " $1").trim()
}

/** Localized label for a drawing tool (sidebar popover, status bar, etc.). */
export function drawToolLabel(
  t: (key: string) => string,
  toolName: string,
): string {
  const localeKey = TOOL_LOCALE_BY_NAME[toolName]
  if (localeKey) {
    const key = `draw.tool.${localeKey}`
    const label = t(key)
    if (label !== key) return label
  }
  return formatToolName(toolName)
}
