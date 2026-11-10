import { createContext, useContext, type ReactNode } from "react";
import { useDrawingTools } from "@/core/headless";

type ChartDrawingToolsValue = ReturnType<typeof useDrawingTools>;

const ChartDrawingToolsContext = createContext<ChartDrawingToolsValue | null>(null);

/**
 * react-klinecharts-ui stores activeTool in local useState per hook call.
 * Mount once so Esc, sidebar and status bar share the same tool selection.
 */
export function ChartDrawingToolsProvider({ children }: { children: ReactNode }) {
  const tools = useDrawingTools();
  return (
    <ChartDrawingToolsContext.Provider value={tools}>{children}</ChartDrawingToolsContext.Provider>
  );
}

export function useChartDrawingTools(): ChartDrawingToolsValue {
  const ctx = useContext(ChartDrawingToolsContext);
  if (!ctx) {
    throw new Error("useChartDrawingTools must be used within ChartDrawingToolsProvider");
  }
  return ctx;
}
