import type { FC, SVGProps } from "react";

export type TvIconProps = SVGProps<SVGSVGElement>;

/** TradingView Cursor: Crosshair (+) */
export const TvCrosshairIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    <line x1="12" y1="3" x2="12" y2="8.5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="15.5" x2="12" y2="21" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="12" x2="8.5" y2="12" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="15.5" y1="12" x2="21" y2="12" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** TradingView Cursor: Dot */
export const TvDotCursorIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

/** TradingView Cursor: Arrow */
export const TvArrowCursorIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" {...props}>
    <path d="M7 4.5l11.5 5.5-5.5 2-2 5.5z" />
  </svg>
);

/** TradingView Trend Line: Diagonal line with anchor nodes */
export const TvTrendLineIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="5.5" y1="18.5" x2="18.5" y2="5.5" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="5.5" cy="18.5" r="2.25" fill="currentColor" stroke="none" />
    <circle cx="18.5" cy="5.5" r="2.25" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Ray Line: Ray extending with arrow / endpoint */
export const TvRayLineIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="5" y1="19" x2="19" y2="5" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="5" cy="19" r="2.25" fill="currentColor" stroke="none" />
    <path d="M19 5l-5 1m5-1l-1 5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** TradingView Horizontal Line */
export const TvHorizontalLineIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="3" y1="12" x2="21" y2="12" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Vertical Line */
export const TvVerticalLineIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="12" y1="3" x2="12" y2="21" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="12" cy="12" r="2.25" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Parallel Channel */
export const TvParallelChannelIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="4" y1="16" x2="18" y2="4" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="6" y1="20" x2="20" y2="8" strokeWidth="1.75" strokeLinecap="round" />
    <line x1="5" y1="18" x2="19" y2="6" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" />
    <circle cx="4" cy="16" r="2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="4" r="2" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Fibonacci Retracement */
export const TvFibRetracementIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <line x1="3" y1="4.5" x2="21" y2="4.5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="9.5" x2="21" y2="9.5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="14.5" x2="21" y2="14.5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="3" y1="19.5" x2="21" y2="19.5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="6" y1="19.5" x2="18" y2="4.5" strokeWidth="1.25" strokeDasharray="2 2" strokeLinecap="round" />
    <circle cx="6" cy="19.5" r="2" fill="currentColor" stroke="none" />
    <circle cx="18" cy="4.5" r="2" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Gann Box */
export const TvGannBoxIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="4" y="4" width="16" height="16" rx="1.5" strokeWidth="1.5" />
    <line x1="4" y1="4" x2="20" y2="20" strokeWidth="1.2" strokeDasharray="2 2" />
    <line x1="4" y1="20" x2="20" y2="4" strokeWidth="1.2" strokeDasharray="2 2" />
    <circle cx="4" cy="4" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="20" cy="20" r="1.75" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Geometric Shapes: Rectangle with corner handles */
export const TvRectangleIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="4.5" y="6.5" width="15" height="11" rx="1.5" strokeWidth="1.75" />
    <circle cx="4.5" cy="6.5" r="2" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="6.5" r="2" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="17.5" r="2" fill="currentColor" stroke="none" />
    <circle cx="4.5" cy="17.5" r="2" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Circle Shape */
export const TvCircleIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <circle cx="12" cy="12" r="7.5" strokeWidth="1.75" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="12" r="2" fill="currentColor" stroke="none" />
    <line x1="12" y1="12" x2="19.5" y2="12" strokeWidth="1.25" strokeDasharray="1.5 1.5" />
  </svg>
);

/** TradingView Triangle Shape */
export const TvTriangleIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <polygon points="12,5 20,18.5 4,18.5" strokeWidth="1.75" strokeLinejoin="round" />
    <circle cx="12" cy="5" r="2" fill="currentColor" stroke="none" />
    <circle cx="20" cy="18.5" r="2" fill="currentColor" stroke="none" />
    <circle cx="4" cy="18.5" r="2" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Brush / Drawing Pencil */
export const TvBrushIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      d="M17.5 4.5l2 2a1.5 1.5 0 0 1 0 2.1l-9.1 9.1a1 1 0 0 1-.4.25l-4.5 1.3 1.3-4.5a1 1 0 0 1 .25-.4l9.1-9.1a1.5 1.5 0 0 1 2.1 0z"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M4 21c1.5-.5 3-1.5 4.5-.5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** TradingView Harmonic / Wave Pattern (XABCD) */
export const TvWavesIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <polyline
      points="4,18 8,7 12,15 16,6 20,18"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="4" cy="18" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="8" cy="7" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="16" cy="6" r="1.75" fill="currentColor" stroke="none" />
    <circle cx="20" cy="18" r="1.75" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Long Position Tool (Green TP top, Red SL bottom, Entry divider) */
export const TvLongPositionIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    {/* Target area (profit - green) */}
    <rect x="4" y="5" width="16" height="6.5" rx="1.5" fill="#22c55e" fillOpacity="0.28" stroke="#22c55e" strokeWidth="1.5" />
    {/* Stoploss area (loss - red) */}
    <rect x="4" y="12.5" width="16" height="6.5" rx="1.5" fill="#ef4444" fillOpacity="0.28" stroke="#ef4444" strokeWidth="1.5" />
    {/* Entry center line */}
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/** TradingView Short Position Tool (Red SL top, Green TP bottom, Entry divider) */
export const TvShortPositionIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    {/* Stoploss area (loss - red) */}
    <rect x="4" y="5" width="16" height="6.5" rx="1.5" fill="#ef4444" fillOpacity="0.28" stroke="#ef4444" strokeWidth="1.5" />
    {/* Target area (profit - green) */}
    <rect x="4" y="12.5" width="16" height="6.5" rx="1.5" fill="#22c55e" fillOpacity="0.28" stroke="#22c55e" strokeWidth="1.5" />
    {/* Entry center line */}
    <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
  </svg>
);

/** TradingView Volume Profile (FRVP / VPVR) with POC Red line */
export const TvVolumeProfileIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="4" y="5" width="8" height="2" fill="currentColor" stroke="none" opacity="0.6" />
    <rect x="4" y="8" width="13" height="2" fill="currentColor" stroke="none" opacity="0.6" />
    <rect x="4" y="11" width="16" height="2" fill="#ef4444" stroke="none" />
    <line x1="3" y1="12" x2="21" y2="12" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
    <rect x="4" y="14" width="11" height="2" fill="currentColor" stroke="none" opacity="0.6" />
    <rect x="4" y="17" width="6" height="2" fill="currentColor" stroke="none" opacity="0.6" />
  </svg>
);

/** TradingView Measure / Ruler */
export const TvMeasureIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      d="M5.5 19.5L19.5 5.5l2 2-14 14z"
      strokeWidth="1.75"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    <line x1="9" y1="13" x2="11" y2="15" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="10" x2="15" y2="13" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="15" y1="7" x2="17" y2="9" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** TradingView Magnet Mode */
export const TvMagnetIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      d="M6 5v7a6 6 0 0 0 12 0V5h-3.5v7a2.5 2.5 0 0 1-5 0V5H6z"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <line x1="6" y1="8" x2="9.5" y2="8" strokeWidth="1.5" />
    <line x1="14.5" y1="8" x2="18" y2="8" strokeWidth="1.5" />
  </svg>
);

/** TradingView Padlock (Locked) */
export const TvLockIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" strokeWidth="1.75" />
    <path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0v3.5" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Padlock (Unlocked) */
export const TvUnlockIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2" strokeWidth="1.75" />
    <path d="M8.5 10.5V7a3.5 3.5 0 0 1 7 0" strokeWidth="1.75" strokeLinecap="round" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

/** TradingView Eye (Visible) */
export const TvEyeIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path
      d="M3 12s3.5-6.5 9-6.5S21 12 21 12s-3.5 6.5-9 6.5S3 12 3 12z"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="2.75" strokeWidth="1.75" />
  </svg>
);

/** TradingView Eye (Hidden / EyeOff) */
export const TvEyeOffIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M3 3l18 18" strokeWidth="1.75" strokeLinecap="round" />
    <path
      d="M10.5 10.5a3 3 0 0 0 4.2 4.2M9.4 6C10.2 5.7 11.1 5.5 12 5.5c5.5 0 9 6.5 9 6.5s-1.2 2.2-3.1 3.8M5.8 8.6C4.1 10.3 3 12 3 12s3.5 6.5 9 6.5c1.6 0 3-.4 4.3-1"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** TradingView Trash / Remove All */
export const TvTrashIcon: FC<TvIconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...props}>
    <path d="M4.5 7h15" strokeWidth="1.75" strokeLinecap="round" />
    <path d="M9 7V4.5a1.5 1.5 0 0 1 1.5-1.5h3a1.5 1.5 0 0 1 1.5 1.5V7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6.5 7l1 12.5a2 2 0 0 0 2 1.5h5a2 2 0 0 0 2-1.5l1-12.5" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="10" y1="11" x2="10" y2="16.5" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="14" y1="11" x2="14" y2="16.5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Signature TradingView bottom-right popover trigger micro triangle */
export const TvFlyoutArrow: FC<TvIconProps> = (props) => (
  <svg
    viewBox="0 0 5 5"
    fill="currentColor"
    className="absolute bottom-1 right-1 size-1.5 opacity-60 pointer-events-none"
    {...props}
  >
    <polygon points="5,0 5,5 0,5" />
  </svg>
);

/** Helper to look up the exact TradingView icon for any drawing tool */
export function getTvToolIcon(toolName: string): FC<TvIconProps> {
  switch (toolName) {
    // Single line
    case "straightLine":
    case "segment":
      return TvTrendLineIcon;
    case "rayLine":
    case "arrow":
      return TvRayLineIcon;
    case "horizontalStraightLine":
    case "horizontalRayLine":
    case "horizontalSegment":
    case "priceLine":
      return TvHorizontalLineIcon;
    case "verticalStraightLine":
    case "verticalRayLine":
    case "verticalSegment":
      return TvVerticalLineIcon;

    // More line / channels
    case "parallelChannel":
    case "priceChannelLine":
    case "parallelStraightLine":
    case "ray":
      return TvParallelChannelIcon;

    // Fibonacci & Gann
    case "fibRetracement":
    case "fibonacciLine":
    case "fibonacciSegment":
    case "fibonacciExtension":
    case "fibonacciSpeedResistanceFan":
    case "fibonacciCircle":
    case "fibonacciSpiral":
    case "gannFan":
      return TvFibRetracementIcon;
    case "gannBox":
      return TvGannBoxIcon;

    // Shapes
    case "rect":
    case "parallelogram":
      return TvRectangleIcon;
    case "circle":
      return TvCircleIcon;
    case "triangle":
      return TvTriangleIcon;

    // Waves
    case "xabcd":
    case "abcd":
    case "threeWaves":
    case "fiveWaves":
    case "eightWaves":
    case "anyWaves":
    case "elliottWave":
      return TvWavesIcon;

    // Positions
    case "longPosition":
      return TvLongPositionIcon;
    case "shortPosition":
      return TvShortPositionIcon;

    // Annotations & Measure
    case "brush":
      return TvBrushIcon;
    case "measure":
      return TvMeasureIcon;
    case "fixedRangeVolumeProfile":
      return TvVolumeProfileIcon;

    default:
      return TvTrendLineIcon;
  }
}

/** Map category keys to default TradingView icons */
export const TV_CATEGORY_ICONS: Record<string, FC<TvIconProps>> = {
  singleLine: TvTrendLineIcon,
  moreLine: TvParallelChannelIcon,
  polygon: TvRectangleIcon,
  fibonacci: TvFibRetracementIcon,
  wave: TvWavesIcon,
  measure: TvMeasureIcon,
  position: TvLongPositionIcon,
  annotation: TvBrushIcon,
};
