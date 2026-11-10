import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SimpleTooltip as Tooltip } from "@/features/chart/components/ui/simple-tooltip"
import { useChartT } from "@/features/chart/hooks/use-chart-t"

interface DrawingPanelToggleProps {
  showDrawing: boolean
  onToggleDrawing: () => void
}

export function DrawingPanelToggle({
  showDrawing,
  onToggleDrawing,
}: DrawingPanelToggleProps) {
  const { t } = useChartT()

  return (
    <Tooltip content={t("toolbar.drawingTools")} side="bottom">
      <Button
        variant={showDrawing ? "secondary" : "ghost"}
        size="icon-sm"
        className="shrink-0 overflow-hidden p-0"
        onClick={onToggleDrawing}
        aria-label={t("toolbar.drawingTools")}
      >
        <PanelLeft className="size-4" />
      </Button>
    </Tooltip>
  )
}
