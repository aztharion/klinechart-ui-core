export type ChartFocusTarget =
  | { kind: "overlay"; id: string; name: string; paneId: string }
  | { kind: "indicator"; name: string; paneId: string; isMain: boolean };

export type ChartContextMenuState = {
  x: number;
  y: number;
  target: ChartFocusTarget;
} | null;

export function focusTargetKey(target: ChartFocusTarget): string {
  if (target.kind === "overlay") return `overlay:${target.id}`;
  return `indicator:${target.isMain ? "main" : "sub"}:${target.name}`;
}

export function isSameFocusTarget(
  a: ChartFocusTarget | null,
  b: ChartFocusTarget | null,
): boolean {
  if (!a || !b) return false;
  return focusTargetKey(a) === focusTargetKey(b);
}
