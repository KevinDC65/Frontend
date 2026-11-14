/**
 * Generador de series mensuales SIMULADAS con el modelo del marco teórico del informe (sección 2):
 *   x_t = μ_m(t) + β·t + γ·E_(t−ℓ) + ε_t,   ε_t = φ·ε_(t−1) + η_t
 * Sirve solo para demostrar la interfaz; no son datos de la NASA.
 */
import { N12_EVENTS, ONI_EVENTS, type EnsoEvent } from '@/data/enso';
import type { Region } from '@/data/regions';
import { END_YEAR, FIRST_YEAR, type Variable } from '@/data/variables';

export type MonthPoint = { year: number; month: number; t: number };
export type IndexName = 'ONI' | 'N12';

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function gaussian(rand: () => number) {
  const u = Math.max(rand(), 1e-12);
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export const MONTHS: MonthPoint[] = (() => {
  const out: MonthPoint[] = [];
  for (let y = FIRST_YEAR; y <= END_YEAR; y++) {
    for (let m = 1; m <= 12; m++) out.push({ year: y, month: m, t: y + (m - 0.5) / 12 });
  }
  return out;
})();

function buildIndex(events: EnsoEvent[], seed: number, noise: number) {
  const rand = mulberry32(seed);
  let e = 0;
  return MONTHS.map(({ year, month }) => {
    const idx = year * 12 + month;
    let v = 0;
    for (const ev of events) {
      const d = idx - (ev.year * 12 + ev.month);
      const w = ev.width ?? 6;
      v += ev.amp * Math.exp(-((d / w) ** 2));
    }
    e = 0.8 * e + noise * gaussian(rand);
    return Math.round((v + e) * 100) / 100;
  });
}

const INDEX_CACHE: Partial<Record<IndexName, number[]>> = {};

export function getIndex(name: IndexName) {
  if (!INDEX_CACHE[name]) {
    INDEX_CACHE[name] = name === 'ONI' ? buildIndex(ONI_EVENTS, 7, 0.12) : buildIndex(N12_EVENTS, 11, 0.25);
  }
  return INDEX_CACHE[name]!;
}

/** Respuesta regional a El Niño: +1 costa del Pacífico oriental, −1 continente marítimo. */
export function ensoFactor(r: Region) {
  const { lat, lon } = r;
  if (lon >= -92 && lon <= -74 && lat >= -14 && lat <= 4) return 1;
  if (lon >= 95 && lon <= 155 && lat >= -28 && lat <= 10) return -1;
  if (lon >= -75 && lon <= -44 && lat >= -15 && lat <= 6) return -0.55;
  if (lon >= 68 && lon <= 90 && lat >= 8 && lat <= 30) return -0.4;
  if (lon >= -125 && lon <= -110 && lat >= 30 && lat <= 42) return 0.35;
  if (lon >= -18 && lon <= 30 && lat >= 8 && lat <= 20) return -0.25;
  const h = hashString(`${lat.toFixed(1)}|${lon.toFixed(1)}`);
  return ((h % 1000) / 1000 - 0.5) * 0.5;
}

type Profile = {
  mean: number;
  seasonal: number;
  betaDec: number;
  gamma: number;
  asym: number;
  lag: number;
  noise: number;
  phi: number;
  min?: number;
  max?: number;
};

function profileFor(v: Variable, r: Region, rand: () => number): Profile {
  const f = ensoFactor(r);
  const absLat = Math.abs(r.lat);
  const coastal = f >= 0.99;
  const jitter = (s: number) => (rand() - 0.5) * s;
  switch (v.kind) {
    case 'rain':
      return {
        mean: coastal ? 0.7 : f <= -0.99 ? 6 : 2.6 + jitter(1.5),
        seasonal: coastal ? 0.6 : 1.8,
        betaDec: coastal ? 0.09 : f <= -0.99 ? -0.04 : jitter(0.25),
        gamma: f * (coastal ? 0.35 : 1.1),
        asym: coastal ? 1.6 : 0,
        lag: coastal ? 1 : 2,
        noise: coastal ? 0.35 : 0.9,
        phi: 0.4,
        min: 0,
      };
    case 'temp':
      return {
        mean: 28 - 0.45 * absLat,
        seasonal: 1 + absLat * 0.25,
        betaDec: 0.18 + jitter(0.12),
        gamma: coastal ? 0.75 : 0.25 * f + 0.15,
        asym: 0,
        lag: coastal ? 0 : 3,
        noise: 0.45,
        phi: 0.6,
      };
    case 'humidity':
      return { mean: 72, seasonal: 6, betaDec: jitter(1.2), gamma: f * 3.5, asym: coastal ? 2 : 0, lag: 1, noise: 2.8, phi: 0.5, min: 5, max: 100 };
    case 'soil':
      return { mean: 0.5, seasonal: 0.08, betaDec: jitter(0.02), gamma: f * 0.05, asym: coastal ? 0.04 : 0, lag: 3, noise: 0.035, phi: 0.85, min: 0.02, max: 1 };
    case 'et':
      return { mean: 2.8, seasonal: 0.7, betaDec: jitter(0.12), gamma: f * 0.25, asym: 0, lag: 2, noise: 0.25, phi: 0.5, min: 0 };
    case 'runoff':
      return { mean: 0.9, seasonal: 0.4, betaDec: jitter(0.06), gamma: f * 0.3, asym: coastal ? 0.6 : 0, lag: 2, noise: 0.2, phi: 0.6, min: 0 };
    case 'ndvi':
      return { mean: coastal ? 0.22 : 0.55, seasonal: 0.08, betaDec: 0.006 + jitter(0.01), gamma: f * 0.03, asym: coastal ? 0.04 : 0, lag: 4, noise: 0.025, phi: 0.75, min: 0, max: 1 };
    default:
      return { mean: 0, seasonal: 0, betaDec: 0, gamma: 0, asym: 0, lag: 0, noise: 1, phi: 0 };
  }
}

/** Serie mensual simulada completa (1981–2024) para una variable y región. */
export function simulateSeries(v: Variable, r: Region): number[] {
  const seed = hashString(`${v.id}|${r.lat.toFixed(1)}|${r.lon.toFixed(1)}`);
  const rand = mulberry32(seed);
  const p = profileFor(v, r, rand);
  const coastal = ensoFactor(r) >= 0.99;
  const E = getIndex(coastal ? 'N12' : 'ONI');
  const phase = rand() * 2 * Math.PI;
  const hemi = r.lat >= 0 ? 0 : Math.PI;
  let eps = 0;
  return MONTHS.map((pt, i) => {
    const seasonal = p.seasonal * Math.cos(((pt.month - 1) / 12) * 2 * Math.PI + hemi + phase * 0.2);
    const trend = (p.betaDec / 10) * (pt.t - 2000);
    const e = E[Math.max(0, i - p.lag)];
    const enso = p.gamma * e + p.asym * Math.max(e - 0.8, 0) ** 1.6;
    eps = p.phi * eps + p.noise * Math.sqrt(1 - p.phi * p.phi) * gaussian(rand);
    let x = p.mean + seasonal + trend + enso + eps;
    if (p.min !== undefined) x = Math.max(p.min, x);
    if (p.max !== undefined) x = Math.min(p.max, x);
    return x;
  });
}
