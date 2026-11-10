import { loadPersisted, savePersisted } from "@/features/chart/hooks/use-persistent-state";

const STORAGE_KEY = "indicators";

export interface PersistedChartIndicators {
  main: string[];
  sub: string[];
  /** Indicator name → calcParams values */
  params: Record<string, number[]>;
}

const DEFAULT_INDICATORS: PersistedChartIndicators = {
  main: ["MA"],
  sub: ["VOL"],
  params: {},
};

export function loadPersistedIndicators(): PersistedChartIndicators {
  const raw = loadPersisted<Partial<PersistedChartIndicators> | null>(STORAGE_KEY, null);
  if (!raw) return { ...DEFAULT_INDICATORS, params: {} };

  return {
    main: Array.isArray(raw.main) && raw.main.length > 0 ? raw.main : DEFAULT_INDICATORS.main,
    sub: Array.isArray(raw.sub) && raw.sub.length > 0 ? raw.sub : DEFAULT_INDICATORS.sub,
    params: raw.params && typeof raw.params === "object" ? raw.params : {},
  };
}

export function savePersistedIndicators(state: PersistedChartIndicators): void {
  savePersisted(STORAGE_KEY, state);
}

export function savePersistedIndicatorLists(main: string[], sub: string[]): void {
  const current = loadPersistedIndicators();
  savePersistedIndicators({ ...current, main, sub });
}

export function savePersistedIndicatorParams(name: string, params: number[]): void {
  const current = loadPersistedIndicators();
  savePersistedIndicators({
    ...current,
    params: { ...current.params, [name]: params },
  });
}

export function getPersistedIndicatorParams(name: string): number[] | undefined {
  return loadPersistedIndicators().params[name];
}
  