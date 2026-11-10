import { registerOverlay } from "@/core/klinechart";
import type { Chart, KLineData, OverlayTemplate } from "@/core/klinechart";
import { computeVolumeProfile } from "./compute";
import { toVolumeProfileBar } from "./bar";
import { buildVolumeProfileFigures } from "./draw-volume-profile";
import {
  VPVR_DEFAULT_CALC_PARAMS,
  parseVpvrCalcParams,
  type VolumeProfileConfig,
} from "./types";

export const FRVP_OVERLAY_NAME = "fixedRangeVolumeProfile";

export interface FrvpExtendData {
  rowCount?: number;
  valueAreaPercent?: number;
  placement?: 0 | 1;
  volumeMode?: 0 | 1;
}

const OVERLAY_DRAW_STEP_FINISHED = -1;

function isOverlayComplete(overlay: { currentStep: number }): boolean {
  return overlay.currentStep === OVERLAY_DRAW_STEP_FINISHED;
}

function barIndexForTimestamp(dataList: KLineData[], timestamp: number): number {
  if (dataList.length === 0) return 0;
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].timestamp >= timestamp) return i;
  }
  return dataList.length - 1;
}

function resolveFrvpConfig(extendData: FrvpExtendData | undefined): VolumeProfileConfig {
  const params = [
    extendData?.rowCount ?? VPVR_DEFAULT_CALC_PARAMS[0],
    extendData?.valueAreaPercent ?? VPVR_DEFAULT_CALC_PARAMS[1],
    extendData?.placement ?? VPVR_DEFAULT_CALC_PARAMS[2],
    extendData?.volumeMode ?? VPVR_DEFAULT_CALC_PARAMS[3],
  ];
  return parseVpvrCalcParams(params);
}

function sliceBarsForOverlay(
  chart: Chart,
  points: Array<{ timestamp?: number }>,
): KLineData[] {
  const dataList = chart.getDataList();
  if (dataList.length === 0 || points.length < 2) return [];

  const t0 = points[0].timestamp;
  const t1 = points[1].timestamp;
  if (t0 == null || t1 == null) return [];

  const from = Math.min(barIndexForTimestamp(dataList, t0), barIndexForTimestamp(dataList, t1));
  const to = Math.max(barIndexForTimestamp(dataList, t0), barIndexForTimestamp(dataList, t1));
  return dataList.slice(from, to + 1);
}

export const fixedRangeVolumeProfileOverlay: OverlayTemplate = {
  name: FRVP_OVERLAY_NAME,
  totalStep: 2,
  needDefaultPointFigure: true,
  needDefaultXAxisFigure: true,
  needDefaultYAxisFigure: false,
  extendData: {
    rowCount: VPVR_DEFAULT_CALC_PARAMS[0],
    valueAreaPercent: VPVR_DEFAULT_CALC_PARAMS[1],
    placement: VPVR_DEFAULT_CALC_PARAMS[2],
    volumeMode: VPVR_DEFAULT_CALC_PARAMS[3],
  } satisfies FrvpExtendData,
  createPointFigures: (params) => {
    const { chart, overlay, coordinates, yAxis } = params;
    if (!yAxis || coordinates.length < 2 || !isOverlayComplete(overlay)) return [];

    const bars = sliceBarsForOverlay(chart, overlay.points);
    if (bars.length === 0) return [];

    const config = resolveFrvpConfig(overlay.extendData as FrvpExtendData | undefined);
    const result = computeVolumeProfile(
      bars.map((bar) => toVolumeProfileBar(bar)),
      config,
    );
    if (!result) return [];

    const xLeft = coordinates[0].x;
    const xRight = coordinates[1].x;
    return buildVolumeProfileFigures(result, config, xLeft, xRight, yAxis);
  },
};

let registered = false;

export function ensureFrvpOverlayRegistered(): void {
  if (registered) return;
  registerOverlay(fixedRangeVolumeProfileOverlay);
  registered = true;
}

export const FRVP_OVERLAY_NAMES = new Set([FRVP_OVERLAY_NAME]);
