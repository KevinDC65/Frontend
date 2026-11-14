/** Orquesta el flujo de la figura 2 del informe sobre una serie simulada. */
import type { Region } from '@/data/regions';
import type { Variable } from '@/data/variables';

import { getIndex, MONTHS, simulateSeries, type IndexName } from './simulate';
import {
  anomalies,
  corr,
  corrEffective,
  jointRegression,
  mean,
  selectLag,
  shift,
  std,
  trendTest,
  verdict,
  type TrendResult,
  type VerdictId,
} from './stats';

export type Resolution = 'mensual' | 'anual';

export type AnalysisInput = {
  variable: Variable;
  region: Region;
  startYear: number;
  endYear: number;
  resolution: Resolution;
  index: IndexName;
};

export type PhaseBand = { start: number; end: number; type: 'nino' | 'nina'; peak: number };

export type Analysis = {
  t: number[];
  orig: number[];
  sin: number[];
  index: number[];
  lag: number;
  ensoR: number;
  gamma: number;
  trendOrig: TrendResult;
  trendSin: TrendResult;
  verdict: VerdictId;
  direction: 'sube' | 'baja';
  rawMean: number;
  nMonths: number;
  years: number;
  colinearity: number;
  warnings: string[];
  bands: PhaseBand[];
  strongNinos: string[];
  delta: { orig: number; sin: number } | null;
  unusual: { nino: number; nina: number; neutral: number; total: number };
  ensoCorr: { r: number; ne: number; p: number };
};

function phaseBands(t: number[], E: number[]): PhaseBand[] {
  const bands: PhaseBand[] = [];
  let i = 0;
  while (i < E.length) {
    const type = E[i] >= 0.5 ? 'nino' : E[i] <= -0.5 ? 'nina' : null;
    if (!type) {
      i++;
      continue;
    }
    let j = i;
    let peak = 0;
    while (j < E.length && (type === 'nino' ? E[j] >= 0.5 : E[j] <= -0.5)) {
      if (Math.abs(E[j]) > Math.abs(peak)) peak = E[j];
      j++;
    }
    // NOAA exige 5 estaciones seguidas; aquí se usa el umbral mensual simplificado (informe, V6).
    if (j - i >= 5) bands.push({ start: t[i] - 1 / 24, end: t[j - 1] + 1 / 24, type, peak });
    i = j;
  }
  return bands;
}

export function runAnalysis(input: AnalysisInput): Analysis {
  const { variable, region, startYear, endYear, resolution } = input;
  const raw = simulateSeries(variable, region);
  const E = getIndex(input.index);
  const from = Math.max(startYear, variable.startYear);
  const sel = MONTHS.map((m, i) => ({ ...m, i })).filter((m) => m.year >= from && m.year <= endYear);

  const x = sel.map((m) => raw[m.i]);
  const months = sel.map((m) => m.month);
  const tm = sel.map((m) => m.t);
  const Em = sel.map((m) => E[m.i]);
  const am = anomalies(x, months);

  // C9 y C10 se calculan siempre en escala mensual.
  const { lag, r: ensoR } = selectLag(am, Em);
  const Elag = shift(Em, lag);
  const reg = jointRegression(am, tm, Elag);
  const sm = reg.sinNino;

  let t = tm, orig = am, sin = sm, idx = Em;
  if (resolution === 'anual') {
    const years = Array.from(new Set(sel.map((m) => m.year)));
    const agg = (arr: number[]) => years.map((y) => mean(arr.filter((_, k) => sel[k].year === y)));
    t = years.map((y) => y + 0.5);
    orig = agg(am);
    sin = agg(sm);
    idx = agg(Em);
  }

  const maxLag = resolution === 'anual' ? 3 : 12;
  const trendOrig = trendTest(orig, t, maxLag);
  const trendSin = trendTest(sin, t, maxLag);
  const v = verdict(trendOrig.p, trendSin.p);

  const nMonths = sel.length;
  const colinearity = corr(Elag, tm);
  const warnings: string[] = [];
  if (nMonths < 240) warnings.push('Menos de 20 años: una tendencia moderada puede pasar inadvertida (potencia baja).');
  if (Math.abs(colinearity) > 0.3)
    warnings.push(`Colinealidad: el índice y el tiempo están mezclados en la ventana (|r| = ${Math.abs(colinearity).toFixed(2)}).`);
  if (from > startYear) warnings.push(`Esta fuente empieza en ${variable.startYear}: la ventana se ajustó.`);

  const bands = phaseBands(tm, Em);
  const strongNinos = bands
    .filter((b) => b.type === 'nino' && b.peak >= 1.4)
    .map((b) => `${Math.floor(b.start)}–${Math.floor(b.end)}`)
    .map((s) => (s.split('–')[0] === s.split('–')[1] ? s.split('–')[0] : s));

  // C16: comparación entre periodos (descriptiva).
  const p1 = sel.map((m, k) => (m.year <= 2001 ? k : -1)).filter((k) => k >= 0);
  const p2 = sel.map((m, k) => (m.year >= 2003 ? k : -1)).filter((k) => k >= 0);
  const delta =
    p1.length >= 60 && p2.length >= 60
      ? {
          orig: mean(p2.map((k) => am[k])) - mean(p1.map((k) => am[k])),
          sin: mean(p2.map((k) => sm[k])) - mean(p1.map((k) => sm[k])),
        }
      : null;

  // C17: meses inusuales |z| > 2 etiquetados por fase del índice.
  const sa = std(am);
  const unusual = { nino: 0, nina: 0, neutral: 0, total: 0 };
  am.forEach((a, k) => {
    if (Math.abs(a / sa) > 2) {
      unusual.total++;
      const e = Elag[k];
      if (e >= 0.5) unusual.nino++;
      else if (e <= -0.5) unusual.nina++;
      else unusual.neutral++;
    }
  });

  return {
    t,
    orig,
    sin,
    index: idx,
    lag,
    ensoR,
    gamma: reg.gamma,
    trendOrig,
    trendSin,
    verdict: v,
    direction: trendSin.slope >= 0 ? 'sube' : 'baja',
    rawMean: mean(x),
    nMonths,
    years: endYear - from + 1,
    colinearity,
    warnings,
    bands,
    strongNinos,
    delta,
    unusual,
    ensoCorr: corrEffective(am, Elag),
  };
}

export const VERDICTS: Record<VerdictId, { title: string; reading: string; color: string; icon: string }> = {
  robusto: { title: 'Cambio robusto', reading: 'La tendencia no depende de El Niño.', color: '#22C55E', icon: 'check-decagram' },
  sensible: { title: 'Sensible a El Niño', reading: 'Los eventos de El Niño explican la tendencia aparente.', color: '#F28C38', icon: 'waves' },
  oculto: { title: 'Cambio oculto', reading: 'El Niño tapaba una tendencia real.', color: '#8B5CF6', icon: 'eye-outline' },
  sin: { title: 'Sin tendencia detectable', reading: 'Hace falta un registro más largo. No encontrar tendencia también es un hallazgo.', color: '#94A3B8', icon: 'minus-circle-outline' },
};

export function fmt(n: number, d = 2) {
  const s = n.toFixed(d);
  return n > 0 ? `+${s}` : s;
}

export function fmtP(p: number) {
  return p < 0.001 ? 'p < 0.001' : `p = ${p.toFixed(3)}`;
}

/** Decimales según la magnitud de la variable. */
export function decimalsFor(unit: string) {
  return unit === '0–1' || unit === 'adimensional' ? 3 : 2;
}
