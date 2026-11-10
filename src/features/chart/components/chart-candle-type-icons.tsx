import { cn } from "@/lib/utils";

export type CandleTypeKey =
  | "candle_solid"
  | "candle_stroke"
  | "candle_up_stroke"
  | "candle_down_stroke"
  | "ohlc"
  | "area"
  | "heikin_ashi";

type IconProps = { className?: string };

const up = "var(--chart-icon-up, #26a69a)";
const down = "var(--chart-icon-down, #ef5350)";
const wick = 1.15;
const bodyW = 2.75;

function IconFrame({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 shrink-0", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Wick({ x, y1, y2, color }: { x: number; y1: number; y2: number; color: string }) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={wick} strokeLinecap="round" />;
}

function Body({
  x,
  y,
  h,
  color,
  filled,
}: {
  x: number;
  y: number;
  h: number;
  color: string;
  filled: boolean;
}) {
  const cx = x - bodyW / 2;
  if (filled) {
    return <rect x={cx} y={y} width={bodyW} height={h} fill={color} />;
  }
  return (
    <rect
      x={cx}
      y={y}
      width={bodyW}
      height={h}
      fill="none"
      stroke={color}
      strokeWidth={1}
    />
  );
}

/** Filled Japanese candlesticks (default). */
function CandleSolidIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <Wick x={4.5} y1={1.5} y2={14.5} color={down} />
      <Body x={4.5} y={5.5} h={5.5} color={down} filled />
      <Wick x={11.5} y1={2} y2={13} color={up} />
      <Body x={11.5} y={4.5} h={6} color={up} filled />
    </IconFrame>
  );
}

/** Hollow bodies on both candles. */
function CandleStrokeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <Wick x={4.5} y1={1.5} y2={14.5} color={down} />
      <Body x={4.5} y={5.5} h={5.5} color={down} filled={false} />
      <Wick x={11.5} y1={2} y2={13} color={up} />
      <Body x={11.5} y={4.5} h={6} color={up} filled={false} />
    </IconFrame>
  );
}

/** Up candle hollow, down candle filled. */
function CandleUpStrokeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <Wick x={4.5} y1={1.5} y2={14.5} color={down} />
      <Body x={4.5} y={5.5} h={5.5} color={down} filled />
      <Wick x={11.5} y1={2} y2={13} color={up} />
      <Body x={11.5} y={4.5} h={6} color={up} filled={false} />
    </IconFrame>
  );
}

/** Down candle hollow, up candle filled. */
function CandleDownStrokeIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <Wick x={4.5} y1={1.5} y2={14.5} color={down} />
      <Body x={4.5} y={5.5} h={5.5} color={down} filled={false} />
      <Wick x={11.5} y1={2} y2={13} color={up} />
      <Body x={11.5} y={4.5} h={6} color={up} filled />
    </IconFrame>
  );
}

/** OHLC / bar chart style — vertical line with open tick left, close tick right. */
function OhlcIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <Wick x={4.5} y1={2} y2={14} color={down} />
      <line x1={2.5} y1={6.25} x2={4.5} y2={6.25} stroke={down} strokeWidth={wick} strokeLinecap="round" />
      <line x1={4.5} y1={10.25} x2={6.5} y2={10.25} stroke={down} strokeWidth={wick} strokeLinecap="round" />
      <Wick x={11.5} y1={2.5} y2={13.5} color={up} />
      <line x1={9.5} y1={5} x2={11.5} y2={5} stroke={up} strokeWidth={wick} strokeLinecap="round" />
      <line x1={11.5} y1={9.5} x2={13.5} y2={9.5} stroke={up} strokeWidth={wick} strokeLinecap="round" />
    </IconFrame>
  );
}

/** Area / mountain chart. */
function AreaIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <defs>
        <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={up} stopOpacity="0.45" />
          <stop offset="100%" stopColor={up} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <path
        d="M1 12.5 L3.5 9.5 L6.5 10.5 L9.5 6 L12.5 7.5 L15 5.5 L15 14 L1 14 Z"
        fill="url(#chart-area-grad)"
      />
      <path
        d="M1 12.5 L3.5 9.5 L6.5 10.5 L9.5 6 L12.5 7.5 L15 5.5"
        stroke={up}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </IconFrame>
  );
}

/** Heikin Ashi — smoothed filled bodies with even wicks. */
function HeikinAshiIcon({ className }: IconProps) {
  return (
    <IconFrame className={className}>
      <Wick x={4.5} y1={2.5} y2={13.5} color={down} />
      <Body x={4.5} y={6} h={4.5} color={down} filled />
      <Wick x={11.5} y1={3} y2={12.5} color={up} />
      <Body x={11.5} y={5.5} h={4.5} color={up} filled />
    </IconFrame>
  );
}

const ICONS: Record<CandleTypeKey, React.ComponentType<IconProps>> = {
  candle_solid: CandleSolidIcon,
  candle_stroke: CandleStrokeIcon,
  candle_up_stroke: CandleUpStrokeIcon,
  candle_down_stroke: CandleDownStrokeIcon,
  ohlc: OhlcIcon,
  area: AreaIcon,
  heikin_ashi: HeikinAshiIcon,
};

export function CandleTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Icon = ICONS[type as CandleTypeKey] ?? CandleSolidIcon;
  return <Icon className={className} />;
}

export const CANDLE_TYPE_KEYS = Object.keys(ICONS) as CandleTypeKey[];
