/**
 * Versión TypeScript simplificada de los cálculos del Informe estadístico.
 * C3 anomalías · C4 Theil-Sen · C5 Mann-Kendall · C6 Hamed-Rao · C7 IC coherente
 * C9 rezago · C10 regresión conjunta · C11 correlación con n efectivo · C13 veredicto.
 */

export function mean(a: number[]) {
  let s = 0;
  for (const v of a) s += v;
  return s / a.length;
}

export function std(a: number[]) {
  const m = mean(a);
  let s = 0;
  for (const v of a) s += (v - m) ** 2;
  return Math.sqrt(s / Math.max(1, a.length - 1));
}

/** Φ(z) con la aproximación de Abramowitz-Stegun. */
export function normCdf(z: number) {
  const t = 1 / (1 + 0.3275911 * (Math.abs(z) / Math.SQRT2));
  const y =
    1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-(z * z) / 2);
  return z >= 0 ? (1 + y) / 2 : (1 - y) / 2;
}

/** p-valor bilateral aproximado de una t de Student. */
export function tPValue(t: number, df: number) {
  const d = Math.max(1, df);
  const z = (t * (1 - 1 / (4 * d))) / Math.sqrt(1 + (t * t) / (2 * d));
  return 2 * (1 - normCdf(Math.abs(z)));
}

export function corr(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  const mx = mean(x.slice(0, n));
  const my = mean(y.slice(0, n));
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : 0;
}

export function lag1(a: number[]) {
  return corr(a.slice(0, -1), a.slice(1));
}

/** C3: anomalías mensuales restando la climatología de cada mes calendario. */
export function anomalies(x: number[], months: number[]) {
  const sum = new Array(13).fill(0);
  const cnt = new Array(13).fill(0);
  x.forEach((v, i) => {
    sum[months[i]] += v;
    cnt[months[i]]++;
  });
  return x.map((v, i) => v - sum[months[i]] / cnt[months[i]]);
}

/** C4: pendientes de todos los pares, ordenadas. */
export function pairSlopes(y: number[], t: number[]) {
  const n = y.length;
  const out = new Float64Array((n * (n - 1)) / 2);
  let k = 0;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) out[k++] = (y[j] - y[i]) / (t[j] - t[i]);
  }
  out.sort();
  return out;
}

function median(sorted: Float64Array) {
  const n = sorted.length;
  return n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
}

function ranks(a: number[]) {
  const idx = a.map((v, i) => [v, i] as const).sort((p, q) => p[0] - q[0]);
  const r = new Array(a.length);
  idx.forEach(([, i], k) => (r[i] = k + 1));
  return r as number[];
}

export type TrendResult = {
  /** Pendiente por unidad de t (año). */
  slope: number;
  ciLow: number;
  ciHigh: number;
  S: number;
  z: number;
  p: number;
  varS: number;
  varSCorr: number;
};

/** C4–C7: Theil-Sen + Mann-Kendall con corrección de Hamed-Rao + IC coherente. */
export function trendTest(y: number[], t: number[], maxLag = 12): TrendResult {
  const n = y.length;
  const slopes = pairSlopes(y, t);
  const slope = median(slopes);

  // C5: estadístico S y su varianza con corrección por empates.
  let S = 0;
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) S += Math.sign(y[j] - y[i]);
  const counts = new Map<number, number>();
  for (const v of y) counts.set(v, (counts.get(v) ?? 0) + 1);
  let ties = 0;
  counts.forEach((g) => {
    if (g > 1) ties += g * (g - 1) * (2 * g + 5);
  });
  const varS = (n * (n - 1) * (2 * n + 5) - ties) / 18;

  // C6: Hamed-Rao, autocorrelación de los rangos de la serie sin tendencia.
  const detr = y.map((v, i) => v - slope * t[i]);
  const rk = ranks(detr);
  const mr = mean(rk);
  let den = 0;
  for (const v of rk) den += (v - mr) ** 2;
  const bound = 1.96 / Math.sqrt(n);
  let sum = 0;
  for (let k = 1; k <= Math.min(maxLag, n - 3); k++) {
    let num = 0;
    for (let i = 0; i < n - k; i++) num += (rk[i] - mr) * (rk[i + k] - mr);
    const rho = num / den;
    if (Math.abs(rho) > bound) sum += (n - k) * (n - k - 1) * (n - k - 2) * rho;
  }
  const ratio = 1 + (2 / (n * (n - 1) * (n - 2))) * sum;
  const varSCorr = ratio > 0 ? varS * ratio : varS;

  const z = S === 0 ? 0 : (S - Math.sign(S)) / Math.sqrt(varSCorr);
  const p = 2 * (1 - normCdf(Math.abs(z)));

  // C7: intervalo con la misma varianza corregida.
  const N = slopes.length;
  const C = 1.96 * Math.sqrt(varSCorr);
  const m1 = Math.min(N, Math.max(1, Math.round((N - C) / 2)));
  const m2 = Math.min(N - 1, Math.max(0, Math.round((N + C) / 2)));
  return { slope, ciLow: slopes[m1 - 1], ciHigh: slopes[m2], S, z, p, varS, varSCorr };
}

export function shift(E: number[], lag: number) {
  return E.map((_, i) => E[Math.max(0, i - lag)]);
}

/** C9: rezago 0–6 con máxima |correlación|. */
export function selectLag(a: number[], E: number[], maxLag = 6) {
  let best = { lag: 0, r: 0 };
  for (let l = 0; l <= maxLag; l++) {
    const r = corr(a.slice(l), E.slice(0, E.length - l));
    if (Math.abs(r) > Math.abs(best.r)) best = { lag: l, r };
  }
  return best;
}

/** C10: a_t = α + β t + γ (E_(t−ℓ) − Ē) + ε; devuelve γ y la serie sin El Niño. */
export function jointRegression(a: number[], t: number[], Elag: number[]) {
  const n = a.length;
  const mE = mean(Elag);
  const mt = mean(t);
  const X = a.map((_, i) => [1, t[i] - mt, Elag[i] - mE]);
  const XtX = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  const Xty = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    for (let r = 0; r < 3; r++) {
      Xty[r] += X[i][r] * a[i];
      for (let c = 0; c < 3; c++) XtX[r][c] += X[i][r] * X[i][c];
    }
  }
  const coef = solve3(XtX, Xty);
  const gamma = coef[2];
  const resid = a.map((v, i) => v - gamma * (Elag[i] - mE));
  return { alpha: coef[0], beta: coef[1], gamma, sinNino: resid };
}

function solve3(A: number[][], b: number[]) {
  const M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < 3; c++) {
    let p = c;
    for (let r = c + 1; r < 3; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    if (Math.abs(M[c][c]) < 1e-12) return [0, 0, 0];
    for (let r = 0; r < 3; r++) {
      if (r === c) continue;
      const f = M[r][c] / M[c][c];
      for (let k = c; k < 4; k++) M[r][k] -= f * M[c][k];
    }
  }
  return [M[0][3] / M[0][0], M[1][3] / M[1][1], M[2][3] / M[2][2]];
}

/** C11: correlación entre dos series autocorrelacionadas con tamaño efectivo (Bretherton). */
export function corrEffective(x: number[], y: number[]) {
  const n = Math.min(x.length, y.length);
  const r = corr(x, y);
  const p1 = lag1(x);
  const p2 = lag1(y);
  const ne = Math.max(3, Math.min(n, (n * (1 - p1 * p2)) / (1 + p1 * p2)));
  const t = r * Math.sqrt((ne - 2) / Math.max(1e-9, 1 - r * r));
  return { r, ne, p: tPValue(t, ne - 2) };
}

export type VerdictId = 'robusto' | 'sensible' | 'oculto' | 'sin';

/** C13: veredicto de cuatro estados. */
export function verdict(pOrig: number, pSin: number, alpha = 0.05): VerdictId {
  const o = pOrig < alpha;
  const s = pSin < alpha;
  if (o && s) return 'robusto';
  if (o && !s) return 'sensible';
  if (!o && s) return 'oculto';
  return 'sin';
}
