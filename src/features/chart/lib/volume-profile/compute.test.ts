import { describe, expect, it } from "vitest";
import { computeVolumeProfile } from "./compute";
import type { VolumeProfileBar, VolumeProfileConfig } from "./types";

const baseConfig: VolumeProfileConfig = {
  rowCount: 5,
  valueAreaPercent: 70,
  placement: "right",
  volumeMode: "total",
};

function bar(overrides: Partial<VolumeProfileBar> & Pick<VolumeProfileBar, "low" | "high">): VolumeProfileBar {
  return {
    open: overrides.open ?? overrides.low,
    close: overrides.close ?? overrides.high,
    volume: overrides.volume ?? 100,
    ...overrides,
  };
}

describe("computeVolumeProfile", () => {
  it("returns null when there is no volume", () => {
    const result = computeVolumeProfile(
      [bar({ low: 10, high: 12, volume: 0 }), bar({ low: 11, high: 13, volume: 0 })],
      baseConfig,
    );
    expect(result).toBeNull();
  });

  it("finds POC at the price level with the highest distributed volume", () => {
    const result = computeVolumeProfile(
      [
        bar({ low: 10, high: 14, volume: 100 }),
        bar({ low: 12, high: 16, volume: 400 }),
        bar({ low: 14, high: 18, volume: 100 }),
      ],
      baseConfig,
    );

    expect(result).not.toBeNull();
    expect(result!.pocPrice).toBeGreaterThan(12);
    expect(result!.pocPrice).toBeLessThan(16);
  });

  it("distributes a bar volume evenly across overlapping rows", () => {
    const result = computeVolumeProfile([bar({ low: 10, high: 20, volume: 50 })], {
      ...baseConfig,
      rowCount: 5,
    });

    expect(result).not.toBeNull();
    const nonZeroRows = result!.rows.filter((row) => row.totalVolume > 0);
    expect(nonZeroRows.length).toBeGreaterThan(1);
    const volumes = nonZeroRows.map((row) => row.totalVolume);
    expect(Math.max(...volumes) - Math.min(...volumes)).toBeLessThan(0.001);
  });

  it("builds a value area that reaches the configured percentage", () => {
    const result = computeVolumeProfile(
      [
        bar({ low: 0, high: 4, volume: 10 }),
        bar({ low: 4, high: 8, volume: 40 }),
        bar({ low: 8, high: 12, volume: 30 }),
        bar({ low: 12, high: 16, volume: 20 }),
      ],
      { ...baseConfig, rowCount: 4, valueAreaPercent: 70 },
    );

    expect(result).not.toBeNull();

    const vaVolume = result!.rows
      .filter((row) => row.index >= result!.valIndex && row.index <= result!.vahIndex)
      .reduce((sum, row) => sum + row.totalVolume, 0);

    expect(vaVolume / result!.totalVolume).toBeGreaterThanOrEqual(0.7 - 1e-6);
  });

  it("breaks value-area ties by choosing the row closer to POC, then above", () => {
    const symmetric = computeVolumeProfile(
      [
        bar({ low: 0, high: 2, volume: 30 }),
        bar({ low: 2, high: 4, volume: 40 }),
        bar({ low: 4, high: 6, volume: 30 }),
      ],
      { ...baseConfig, rowCount: 3, valueAreaPercent: 100 },
    );

    expect(symmetric).not.toBeNull();
    expect(symmetric!.valIndex).toBeLessThanOrEqual(symmetric!.pocIndex);
    expect(symmetric!.vahIndex).toBeGreaterThanOrEqual(symmetric!.pocIndex);
  });

  it("handles a single bar", () => {
    const result = computeVolumeProfile([bar({ low: 10, high: 20, volume: 100 })], baseConfig);
    expect(result).not.toBeNull();
    expect(result!.totalVolume).toBeCloseTo(100, 4);
    expect(result!.pocPrice).toBeGreaterThan(10);
    expect(result!.pocPrice).toBeLessThan(20);
  });

  it("covers 100% value area across all rows", () => {
    const result = computeVolumeProfile(
      [
        bar({ low: 0, high: 2, volume: 10 }),
        bar({ low: 2, high: 4, volume: 20 }),
        bar({ low: 4, high: 6, volume: 30 }),
      ],
      { ...baseConfig, rowCount: 3, valueAreaPercent: 100 },
    );

    expect(result).not.toBeNull();
    expect(result!.valIndex).toBe(0);
    expect(result!.vahIndex).toBe(2);
  });

  it("tracks up/down volume split", () => {
    const result = computeVolumeProfile(
      [
        bar({ low: 10, high: 12, open: 10, close: 12, volume: 100 }),
        bar({ low: 12, high: 14, open: 14, close: 12, volume: 200 }),
      ],
      { ...baseConfig, rowCount: 4, volumeMode: "updown" },
    );

    expect(result).not.toBeNull();
    const upTotal = result!.rows.reduce((sum, row) => sum + row.upVolume, 0);
    const downTotal = result!.rows.reduce((sum, row) => sum + row.downVolume, 0);
    expect(upTotal).toBeGreaterThan(0);
    expect(downTotal).toBeGreaterThan(0);
    expect(upTotal + downTotal).toBeCloseTo(result!.totalVolume, 4);
  });
});
