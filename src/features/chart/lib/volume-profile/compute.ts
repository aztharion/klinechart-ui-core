import type {
  VolumeProfileBar,
  VolumeProfileConfig,
  VolumeProfileResult,
  VolumeProfileRow,
} from "./types";

function createRows(minPrice: number, maxPrice: number, rowCount: number): VolumeProfileRow[] {
  const step = (maxPrice - minPrice) / rowCount;
  return Array.from({ length: rowCount }, (_, index) => {
    const priceLow = minPrice + step * index;
    const priceHigh = index === rowCount - 1 ? maxPrice : minPrice + step * (index + 1);
    return {
      index,
      priceLow,
      priceHigh,
      priceMid: (priceLow + priceHigh) / 2,
      totalVolume: 0,
      upVolume: 0,
      downVolume: 0,
    };
  });
}

function rowIndexForPrice(price: number, minPrice: number, step: number, rowCount: number): number {
  if (step <= 0) return 0;
  return Math.max(0, Math.min(rowCount - 1, Math.floor((price - minPrice) / step)));
}

function distributeBarVolume(
  rows: VolumeProfileRow[],
  bar: VolumeProfileBar,
  minPrice: number,
  step: number,
  rowCount: number,
): void {
  if (bar.volume <= 0 || !Number.isFinite(bar.volume)) return;

  const low = Math.min(bar.low, bar.high);
  const high = Math.max(bar.low, bar.high);
  const start = rowIndexForPrice(low, minPrice, step, rowCount);
  const end = rowIndexForPrice(high, minPrice, step, rowCount);
  const overlapCount = end - start + 1;
  if (overlapCount <= 0) return;

  const portion = bar.volume / overlapCount;
  const isUp = bar.close > bar.open;

  for (let i = start; i <= end; i++) {
    rows[i].totalVolume += portion;
    if (isUp) rows[i].upVolume += portion;
    else rows[i].downVolume += portion;
  }
}

function findPocIndex(rows: VolumeProfileRow[]): number {
  let pocIndex = 0;
  let maxVolume = -1;

  for (const row of rows) {
    if (row.totalVolume > maxVolume) {
      maxVolume = row.totalVolume;
      pocIndex = row.index;
    }
  }

  return pocIndex;
}

/** TradingView-style value area expansion from POC. */
function computeValueAreaBounds(
  rows: VolumeProfileRow[],
  pocIndex: number,
  valueAreaPercent: number,
): { vahIndex: number; valIndex: number } {
  const totalVolume = rows.reduce((sum, row) => sum + row.totalVolume, 0);
  if (totalVolume <= 0) {
    return { vahIndex: pocIndex, valIndex: pocIndex };
  }

  const target = totalVolume * (valueAreaPercent / 100);
  let valIndex = pocIndex;
  let vahIndex = pocIndex;
  let accumulated = rows[pocIndex]?.totalVolume ?? 0;

  while (accumulated < target && (valIndex > 0 || vahIndex < rows.length - 1)) {
    const aboveIndex = valIndex - 1;
    const belowIndex = vahIndex + 1;
    const aboveVolume = aboveIndex >= 0 ? rows[aboveIndex].totalVolume : -1;
    const belowVolume = belowIndex < rows.length ? rows[belowIndex].totalVolume : -1;

    if (aboveIndex < 0) {
      vahIndex = belowIndex;
      accumulated += rows[belowIndex].totalVolume;
      continue;
    }

    if (belowIndex >= rows.length) {
      valIndex = aboveIndex;
      accumulated += rows[aboveIndex].totalVolume;
      continue;
    }

    if (aboveVolume > belowVolume) {
      valIndex = aboveIndex;
      accumulated += aboveVolume;
      continue;
    }

    if (belowVolume > aboveVolume) {
      vahIndex = belowIndex;
      accumulated += belowVolume;
      continue;
    }

    const distanceAbove = pocIndex - aboveIndex;
    const distanceBelow = belowIndex - pocIndex;

    if (distanceAbove < distanceBelow) {
      valIndex = aboveIndex;
      accumulated += aboveVolume;
    } else if (distanceBelow < distanceAbove) {
      vahIndex = belowIndex;
      accumulated += belowVolume;
    } else {
      valIndex = aboveIndex;
      accumulated += aboveVolume;
    }
  }

  return { vahIndex, valIndex };
}

export function computeVolumeProfile(
  bars: VolumeProfileBar[],
  config: VolumeProfileConfig,
): VolumeProfileResult | null {
  if (bars.length < 1) return null;

  const minPrice = Math.min(...bars.map((bar) => bar.low));
  const maxPrice = Math.max(...bars.map((bar) => bar.high));
  if (!Number.isFinite(minPrice) || !Number.isFinite(maxPrice) || maxPrice <= minPrice) {
    return null;
  }

  const rowCount = config.rowCount;
  const step = (maxPrice - minPrice) / rowCount;
  const rows = createRows(minPrice, maxPrice, rowCount);

  for (const bar of bars) {
    distributeBarVolume(rows, bar, minPrice, step, rowCount);
  }

  const totalVolume = rows.reduce((sum, row) => sum + row.totalVolume, 0);
  if (totalVolume <= 0) return null;

  const pocIndex = findPocIndex(rows);
  const { vahIndex, valIndex } = computeValueAreaBounds(rows, pocIndex, config.valueAreaPercent);
  const maxVolume = Math.max(...rows.map((row) => row.totalVolume));

  return {
    rows,
    pocIndex,
    vahIndex,
    valIndex,
    pocPrice: rows[pocIndex].priceMid,
    vahPrice: rows[vahIndex].priceHigh,
    valPrice: rows[valIndex].priceLow,
    totalVolume,
    maxVolume,
  };
}
