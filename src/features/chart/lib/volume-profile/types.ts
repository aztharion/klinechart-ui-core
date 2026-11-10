export type VolumeProfilePlacement = "right" | "left";
export type VolumeProfileVolumeMode = "total" | "updown";

export interface VolumeProfileBar {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface VolumeProfileConfig {
  rowCount: number;
  valueAreaPercent: number;
  placement: VolumeProfilePlacement;
  volumeMode: VolumeProfileVolumeMode;
}

export interface VolumeProfileRow {
  index: number;
  priceLow: number;
  priceHigh: number;
  priceMid: number;
  totalVolume: number;
  upVolume: number;
  downVolume: number;
}

export interface VolumeProfileResult {
  rows: VolumeProfileRow[];
  pocIndex: number;
  vahIndex: number;
  valIndex: number;
  pocPrice: number;
  vahPrice: number;
  valPrice: number;
  totalVolume: number;
  maxVolume: number;
}

export const VPVR_INDICATOR_NAME = "VPVR";

export const VPVR_DEFAULT_CALC_PARAMS = [48, 70, 0, 0] as const;

/** calcParams: [rows, valueAreaPercent, placement(0=right,1=left), volumeMode(0=total,1=updown)] */
export function parseVpvrCalcParams(calcParams: number[]): VolumeProfileConfig {
  const [rows = 48, valueAreaPercent = 70, placement = 0, volumeMode = 0] = calcParams;
  return {
    rowCount: Math.max(5, Math.min(200, Math.round(rows))),
    valueAreaPercent: Math.max(1, Math.min(100, Math.round(valueAreaPercent))),
    placement: placement === 1 ? "left" : "right",
    volumeMode: volumeMode === 1 ? "updown" : "total",
  };
}
