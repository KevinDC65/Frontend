import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';

import type { PhaseBand } from '@/lib/analysis';
import type { TrendResult } from '@/lib/stats';
import { useVsTheme } from '@/theme/theme-context';

import { Txt } from './ui';

function useWidth(initial = 320) {
  const [w, setW] = useState(initial);
  const onLayout = (e: LayoutChangeEvent) => setW(Math.max(200, e.nativeEvent.layout.width));
  return { w, onLayout };
}

function median(a: number[]) {
  const s = [...a].sort((x, y) => x - y);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

function niceStep(range: number, ticks = 5) {
  const raw = range / ticks;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const n = raw / mag;
  return (n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10) * mag;
}

export function domainOf(values: number[][]): [number, number] {
  let lo = Infinity, hi = -Infinity;
  for (const arr of values) for (const v of arr) {
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  const pad = (hi - lo) * 0.08 || 1;
  return [lo - pad, hi + pad];
}

export type SeriesChartProps = {
  t: number[];
  y: number[];
  color: string;
  trend?: TrendResult;
  showCI?: boolean;
  bands?: PhaseBand[];
  yDomain?: [number, number];
  height?: number;
  yLabel?: string;
  dots?: boolean;
  ghost?: number[];
};

/** Serie de anomalías + recta de Theil-Sen + banda IC 95 % + fases de El Niño. */
export function SeriesChart({ t, y, color, trend, showCI = true, bands = [], yDomain, height = 260, yLabel, dots = true, ghost }: SeriesChartProps) {
  const { theme } = useVsTheme();
  const { w, onLayout } = useWidth();
  const padL = 44, padR = 10, padT = 10, padB = 28;
  const iw = w - padL - padR, ih = height - padT - padB;
  const t0 = Math.floor(t[0]), t1 = Math.ceil(t[t.length - 1]);
  const [y0, y1] = yDomain ?? domainOf(ghost ? [y, ghost] : [y]);
  const X = (v: number) => padL + ((v - t0) / (t1 - t0)) * iw;
  const Y = (v: number) => padT + (1 - (v - y0) / (y1 - y0)) * ih;

  const path = (arr: number[]) => arr.map((v, i) => `${i ? 'L' : 'M'}${X(t[i]).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const ystep = niceStep(y1 - y0);
  const yticks: number[] = [];
  for (let v = Math.ceil(y0 / ystep) * ystep; v <= y1; v += ystep) yticks.push(+v.toFixed(6));
  const xstep = t1 - t0 > 25 ? 5 : t1 - t0 > 12 ? 2 : 1;
  const xticks: number[] = [];
  for (let v = Math.ceil(t0 / xstep) * xstep; v <= t1; v += xstep) xticks.push(v);

  let trendEl = null;
  if (trend) {
    const tm = (t[0] + t[t.length - 1]) / 2;
    const b = median(y.map((v, i) => v - trend.slope * t[i]));
    const ym = b + trend.slope * tm;
    const at = (s: number, tt: number) => ym + s * (tt - tm);
    const ta = t[0], tb = t[t.length - 1];
    const poly = [
      [ta, at(trend.ciHigh, ta)], [tm, ym], [tb, at(trend.ciHigh, tb)], [tb, at(trend.ciLow, tb)], [tm, ym], [ta, at(trend.ciLow, ta)],
    ]
      .map(([a, v]) => `${X(a).toFixed(1)},${Y(v).toFixed(1)}`)
      .join(' ');
    trendEl = (
      <G>
        {showCI && <Polygon points={poly} fill={theme.orange} opacity={0.18} />}
        <Line x1={X(ta)} y1={Y(at(trend.slope, ta))} x2={X(tb)} y2={Y(at(trend.slope, tb))} stroke={theme.orange} strokeWidth={3} strokeLinecap="round" />
      </G>
    );
  }

  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      <Svg width={w} height={height}>
        {bands.map((b, i) => (
          <Rect
            key={i}
            x={Math.max(padL, X(b.start))}
            y={padT}
            width={Math.max(2, Math.min(X(b.end), padL + iw) - Math.max(padL, X(b.start)))}
            height={ih}
            fill={b.type === 'nino' ? theme.orange : theme.blue}
            opacity={b.type === 'nino' ? 0.22 : 0.14}
          />
        ))}
        {yticks.map((v) => (
          <G key={v}>
            <Line x1={padL} x2={padL + iw} y1={Y(v)} y2={Y(v)} stroke={theme.chartGrid} strokeWidth={1} />
            <SvgText fontFamily="sans-serif" x={padL - 6} y={Y(v) + 4} fontSize={10} fill={theme.chartAxis} textAnchor="end">
              {Math.abs(v) < 1e-9 ? '0' : Math.abs(ystep) < 0.1 ? v.toFixed(2) : Math.abs(ystep) < 1 ? v.toFixed(1) : v.toFixed(0)}
            </SvgText>
          </G>
        ))}
        {y0 < 0 && y1 > 0 && <Line x1={padL} x2={padL + iw} y1={Y(0)} y2={Y(0)} stroke={theme.chartAxis} strokeWidth={1} opacity={0.5} />}
        {xticks.map((v) => (
          <SvgText fontFamily="sans-serif" key={v} x={X(v)} y={height - 8} fontSize={10} fill={theme.chartAxis} textAnchor="middle">
            {v}
          </SvgText>
        ))}
        {ghost && <Path d={path(ghost)} stroke={theme.textMuted} strokeWidth={1} fill="none" opacity={0.5} strokeDasharray="3,3" />}
        <Path d={path(y)} stroke={color} strokeWidth={t.length > 120 ? 1 : 1.8} fill="none" opacity={0.8} />
        {dots && y.map((v, i) => <Circle key={i} cx={X(t[i])} cy={Y(v)} r={t.length > 120 ? 1.6 : 3} fill={color} opacity={0.85} />)}
        {trendEl}
        {yLabel && (
          <SvgText fontFamily="sans-serif" x={12} y={padT + ih / 2} fontSize={10} fill={theme.chartAxis} textAnchor="middle" rotation={-90} origin={`12,${padT + ih / 2}`}>
            {yLabel}
          </SvgText>
        )}
      </Svg>
    </View>
  );
}

export function ChartLegend({ items }: { items: { color: string; label: string; kind?: 'dot' | 'line' | 'box' }[] }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
      {items.map((it) => (
        <View key={it.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View
            style={{
              width: it.kind === 'line' ? 16 : 10,
              height: it.kind === 'line' ? 3 : 10,
              borderRadius: it.kind === 'dot' ? 5 : 2,
              backgroundColor: it.color,
              opacity: it.kind === 'box' ? 0.45 : 1,
            }}
          />
          <Txt variant="caption" muted>
            {it.label}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** Índice ONI / Niño 1+2 como barras: positivo naranja (El Niño), negativo azul (La Niña). */
export function IndexChart({ t, values, height = 170, from = 1991, highlight }: { t: number[]; values: number[]; height?: number; from?: number; highlight?: [number, number] }) {
  const { theme } = useVsTheme();
  const { w, onLayout } = useWidth();
  const padL = 30, padR = 8, padT = 8, padB = 24;
  const iw = w - padL - padR, ih = height - padT - padB;
  const pts = t.map((tt, i) => ({ tt, v: values[i] })).filter((p) => p.tt >= from);
  const t0 = from, t1 = Math.ceil(pts[pts.length - 1].tt);
  const X = (v: number) => padL + ((v - t0) / (t1 - t0)) * iw;
  const Y = (v: number) => padT + (1 - (v + 3) / 6) * ih;
  const bw = Math.max(1, iw / pts.length);
  const xt: number[] = [];
  for (let v = Math.ceil(t0 / 5) * 5; v <= t1; v += 5) xt.push(v);
  return (
    <View onLayout={onLayout} style={{ width: '100%' }}>
      <Svg width={w} height={height}>
        {highlight && <Rect x={X(highlight[0])} y={padT} width={X(highlight[1]) - X(highlight[0])} height={ih} fill={theme.primary} opacity={0.12} />}
        {[-2, -1, 0, 1, 2].map((v) => (
          <G key={v}>
            <Line x1={padL} x2={padL + iw} y1={Y(v)} y2={Y(v)} stroke={v === 0 ? theme.chartAxis : theme.chartGrid} opacity={v === 0 ? 0.6 : 1} />
            <SvgText fontFamily="sans-serif" x={padL - 5} y={Y(v) + 3} fontSize={9} fill={theme.chartAxis} textAnchor="end">
              {v > 0 ? `+${v}` : v}
            </SvgText>
          </G>
        ))}
        <Line x1={padL} x2={padL + iw} y1={Y(0.5)} y2={Y(0.5)} stroke={theme.orange} strokeDasharray="4,3" opacity={0.6} />
        <Line x1={padL} x2={padL + iw} y1={Y(-0.5)} y2={Y(-0.5)} stroke={theme.blue} strokeDasharray="4,3" opacity={0.6} />
        {pts.map((p, i) => (
          <Rect
            key={i}
            x={X(p.tt) - bw / 2}
            y={p.v >= 0 ? Y(p.v) : Y(0)}
            width={bw}
            height={Math.abs(Y(p.v) - Y(0))}
            fill={p.v >= 0 ? theme.orange : theme.blue}
            opacity={Math.abs(p.v) >= 0.5 ? 0.95 : 0.4}
          />
        ))}
        {xt.map((v) => (
          <SvgText fontFamily="sans-serif" key={v} x={X(v)} y={height - 7} fontSize={10} fill={theme.chartAxis} textAnchor="middle">
            {v}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
