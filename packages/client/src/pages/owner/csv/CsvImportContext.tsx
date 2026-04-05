import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CsvImportState = {
  fileName: string;
  headers: string[];
  rawSampleLines: string[];
};

type Ctx = {
  state: CsvImportState | null;
  setState: (s: CsvImportState | null) => void;
};

const CsvImportContext = createContext<Ctx | null>(null);

export function CsvImportProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CsvImportState | null>(null);
  const value = useMemo(() => ({ state, setState }), [state]);
  return (
    <CsvImportContext.Provider value={value}>{children}</CsvImportContext.Provider>
  );
}

export function useCsvImport() {
  const ctx = useContext(CsvImportContext);
  if (!ctx) throw new Error("useCsvImport must be used within CsvImportProvider");
  return ctx;
}
