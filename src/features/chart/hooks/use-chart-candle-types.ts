import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CANDLE_TYPES,
  useKlinechartsUI,
  useKlinechartsUISettings,
  type CandleTypeItem,
} from "@/core/headless";
import { loadPersisted, savePersisted } from "@/features/chart/hooks/use-persistent-state";

export const HEIKIN_ASHI_KEY = "heikin_ashi";

const EXTENDED_CANDLE_TYPES: CandleTypeItem[] = [
  ...CANDLE_TYPES,
  { key: HEIKIN_ASHI_KEY, localeKey: HEIKIN_ASHI_KEY },
];

export type ChartTypeKey = (typeof EXTENDED_CANDLE_TYPES)[number]["key"];

interface ChartCandleTypesContextValue {
  candleTypes: CandleTypeItem[];
  selectedType: string;
  heikinEnabled: boolean;
  setChartType: (key: string) => void;
}

const ChartCandleTypesContext = createContext<ChartCandleTypesContextValue | null>(null);

export function ChartCandleTypesProvider({ children }: { children: ReactNode }) {
  const { state } = useKlinechartsUI();
  const { candleType, setCandleType } = useKlinechartsUISettings();
  const [heikinEnabled, setHeikinEnabled] = useState(
    () => loadPersisted<string>("candleType", "candle_solid") === HEIKIN_ASHI_KEY,
  );
  const restored = useRef(false);

  useEffect(() => {
    if (restored.current) return;
    restored.current = true;

    const saved = loadPersisted<string>("candleType", "candle_solid");
    if (saved === HEIKIN_ASHI_KEY) {
      setHeikinEnabled(true);
      setCandleType("candle_solid");
    } else if (CANDLE_TYPES.some((c) => c.key === saved) && saved !== candleType) {
      setCandleType(saved);
    }
  }, [candleType, setCandleType]);

  const prevHeikin = useRef(heikinEnabled);
  useEffect(() => {
    if (prevHeikin.current !== heikinEnabled) {
      prevHeikin.current = heikinEnabled;
      state.chart?.resetData();
    }
  }, [heikinEnabled, state.chart]);

  const setChartType = useCallback(
    (key: string) => {
      savePersisted("candleType", key);
      if (key === HEIKIN_ASHI_KEY) {
        setHeikinEnabled(true);
        setCandleType("candle_solid");
        return;
      }
      setHeikinEnabled(false);
      setCandleType(key);
    },
    [setCandleType],
  );

  const selectedType = heikinEnabled ? HEIKIN_ASHI_KEY : candleType;

  const value = useMemo(
    () => ({
      candleTypes: EXTENDED_CANDLE_TYPES,
      selectedType,
      heikinEnabled,
      setChartType,
    }),
    [selectedType, heikinEnabled, setChartType],
  );

  return createElement(ChartCandleTypesContext.Provider, { value }, children);
}

export function useChartCandleTypes(): ChartCandleTypesContextValue {
  const ctx = useContext(ChartCandleTypesContext);
  if (!ctx) {
    throw new Error("useChartCandleTypes must be used within ChartCandleTypesProvider");
  }
  return ctx;
}
