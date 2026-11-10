import { useState, useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { DomPosition } from "klinecharts";
import { useKLineChart } from "../hooks/useKLineChart";

export interface WidgetProps {
  paneId?: string;
  position?: DomPosition;
  children?: ReactNode;
}

/**
 * A declarative component that injects React elements into specific chart DOM layers using portals.
 * Uses `chart.getDom(paneId, position)` under the hood.
 */
export function Widget({ paneId, position = "main", children }: WidgetProps) {
  const chart = useKLineChart();
  const [targetDom, setTargetDom] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!chart) {
      setTargetDom(null);
      return;
    }

    // Attempt to grab the correct native DOM element from klinecharts
    const dom = chart.getDom(paneId, position);
    setTargetDom(dom);
  }, [chart, paneId, position]);

  if (!targetDom || !children) {
    return null;
  }

  return createPortal(children, targetDom);
}
