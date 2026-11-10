import { type LucideIcon } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function clampMenuPosition(
  x: number,
  y: number,
  width: number,
  height: number,
): { x: number; y: number } {
  const pad = 8;
  const maxX = window.innerWidth - width - pad;
  const maxY = window.innerHeight - height - pad;
  return {
    x: Math.max(pad, Math.min(x, maxX)),
    y: Math.max(pad, Math.min(y, maxY)),
  };
}

interface ChartFloatingContextMenuProps {
  id: string;
  x: number;
  y: number;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

/** TradingView-style floating panel anchored at pointer coordinates. */
export function ChartFloatingContextMenu({
  id,
  x,
  y,
  title,
  children,
}: ChartFloatingContextMenuProps) {
  return createPortal(
    <div
      id={id}
      role="menu"
      className={cn(
        "fixed z-[200] min-w-[220px] max-w-[280px] overflow-hidden rounded-lg",
        "border border-border/80 bg-popover/95 text-popover-foreground shadow-xl backdrop-blur-md",
        "animate-in fade-in-0 zoom-in-95 duration-100",
      )}
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {title ? (
        <div className="border-b border-border/60 px-3 py-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
        </div>
      ) : null}
      <div className="p-1.5">{children}</div>
    </div>,
    document.body,
  );
}

interface ChartContextMenuItemProps {
  icon: LucideIcon;
  label: string;
  shortcut?: string;
  destructive?: boolean;
  onClick: () => void;
}

export function ChartContextMenuItem({
  icon: Icon,
  label,
  shortcut,
  destructive,
  onClick,
}: ChartContextMenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      className={cn(
        "flex h-9 w-full cursor-pointer items-center gap-3 rounded-md px-2.5 text-left outline-none transition-colors",
        "hover:bg-accent/80 focus-visible:bg-accent/80",
        destructive && "text-foreground hover:bg-destructive/10 focus-visible:bg-destructive/10",
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center",
          destructive ? "text-destructive" : "text-muted-foreground",
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <span className={cn("min-w-0 flex-1 text-[13px] leading-none", destructive && "text-destructive")}>
        {label}
      </span>
      {shortcut ? (
        <kbd className="shrink-0 font-sans text-[11px] tabular-nums text-muted-foreground/80">
          {shortcut}
        </kbd>
      ) : null}
    </button>
  );
}

export function ChartContextMenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-border/70" />;
}

/** Shared content styling for Radix chart background context menus. */
export const chartContextMenuContentClass =
  "z-[200] min-w-[220px] overflow-hidden rounded-lg border border-border/80 bg-popover/95 p-1.5 text-popover-foreground shadow-xl backdrop-blur-md";

export const chartContextMenuItemClass =
  "flex h-9 cursor-pointer items-center gap-3 rounded-md px-2.5 text-[13px] outline-none select-none focus:bg-accent/80 data-[highlighted]:bg-accent/80";

export const chartContextMenuIconClass =
  "flex size-5 shrink-0 items-center justify-center text-muted-foreground [&>svg]:size-4 [&>svg]:stroke-[1.75]";
