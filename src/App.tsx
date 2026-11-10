import { TradingTerminal } from "@/features/chart/components/TradingTerminal"
import "@/features/chart/chart.css"

export function App() {
  return (
    <div className="chart-app h-svh w-screen overflow-hidden">
      <TradingTerminal className="h-full w-full" />
    </div>
  )
}

export default App
