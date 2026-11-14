import { createContext, useContext, useState, type ReactNode } from 'react';

import { DEFAULT_A, DEFAULT_B, type Region } from '@/data/regions';
import type { Resolution } from '@/lib/analysis';
import type { IndexName } from '@/lib/simulate';

export type SimState = {
  variableId: string;
  resolution: Resolution;
  startYear: number;
  endYear: number;
  regionA: Region;
  regionB: Region;
  dual: boolean;
  index: IndexName;
  removeNino: boolean;
};

const initial: SimState = {
  variableId: 'V1',
  resolution: 'mensual',
  startYear: 1991,
  endYear: 2024,
  regionA: DEFAULT_A,
  regionB: DEFAULT_B,
  dual: true,
  index: 'ONI',
  removeNino: false,
};

type Ctx = { state: SimState; set: (patch: Partial<SimState>) => void };
const SimCtx = createContext<Ctx | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const set = (patch: Partial<SimState>) => setState((s) => ({ ...s, ...patch }));
  return <SimCtx.Provider value={{ state, set }}>{children}</SimCtx.Provider>;
}

export function useSimulation() {
  const ctx = useContext(SimCtx);
  if (!ctx) throw new Error('useSimulation debe usarse dentro de SimulationProvider');
  return ctx;
}
