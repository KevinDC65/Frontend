import { View } from 'react-native';

import type { Variable } from '@/data/variables';
import { decimalsFor, fmt, fmtP, VERDICTS, type Analysis } from '@/lib/analysis';
import { useVsTheme } from '@/theme/theme-context';

import { Card, Icon, Txt } from './ui';

/** Tarjeta de veredicto (P1 · C13) con tasa de cambio (C4), IC 95 % (C7) y p de Hamed-Rao (C6). */
export function VerdictCard({
  a,
  variable,
  showSin,
  indexName,
  simple,
}: {
  a: Analysis;
  variable: Variable;
  showSin: boolean;
  indexName: string;
  simple?: boolean;
}) {
  const { theme } = useVsTheme();
  const v = VERDICTS[a.verdict];
  const tr = showSin ? a.trendSin : a.trendOrig;
  const d = decimalsFor(variable.unit);
  const significant = tr.p < 0.05;
  const up = tr.slope >= 0;
  const headline = significant ? `Tendencia ${up ? 'al alza' : 'a la baja'} significativa` : 'Tendencia no significativa';
  const pct = variable.percentOk && a.rawMean > 0 ? (100 * tr.slope * 10) / a.rawMean : null;

  return (
    <Card style={{ gap: 10, borderColor: v.color + '88' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name={significant ? (up ? 'trending-up' : 'trending-down') : 'trending-neutral'} size={26} color={significant ? theme.green : theme.textMuted} />
        <Txt variant="label" muted>
          {showSin ? 'Serie sin El Niño' : 'Serie original'}
        </Txt>
      </View>
      <Txt variant="h2" color={significant ? theme.green : theme.text}>
        {headline}
      </Txt>
      <Txt variant="h1" style={{ fontSize: 26 }}>
        {fmt(tr.slope * 10, d)} {variable.unit}/década
      </Txt>
      {!simple && (
        <View style={{ gap: 4 }}>
          <Txt variant="small">
            IC 95 %: [{(tr.ciLow * 10).toFixed(d)}, {(tr.ciHigh * 10).toFixed(d)}]
          </Txt>
          <Txt variant="small">{fmtP(tr.p)} · Mann-Kendall Hamed-Rao</Txt>
          <Txt variant="small" muted>
            Cambio total en la ventana: {fmt(tr.slope * (a.t[a.t.length - 1] - a.t[0]), d)} {variable.unit}
            {pct !== null ? ` · ${fmt(pct, 1)} % por década` : ''}
          </Txt>
        </View>
      )}
      <View style={{ height: 1, backgroundColor: theme.border }} />
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: v.color + '33', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={v.icon} size={22} color={v.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Txt variant="label" muted>
            Veredicto
          </Txt>
          <Txt variant="h3" color={v.color}>
            {v.title} {a.verdict !== 'sin' ? (a.direction === 'sube' ? '↑' : '↓') : ''}
          </Txt>
        </View>
      </View>
      <Txt variant="small" muted>
        {simple ? simpleText(a) : v.reading}
      </Txt>
      <Txt variant="caption" muted>
        Índice usado: {indexName} · rezago {a.lag} {a.lag === 1 ? 'mes' : 'meses'}
      </Txt>
    </Card>
  );
}

function simpleText(a: Analysis) {
  switch (a.verdict) {
    case 'robusto':
      return 'Aunque quitemos los años de El Niño, la variable sigue cambiando. Es como una escalera que sube despacio, haya o no empujones.';
    case 'sensible':
      return 'Parecía que había una tendencia, pero eran los empujones de El Niño. Sin ellos, la escalera queda casi plana.';
    case 'oculto':
      return 'El Niño hacía ruido y escondía un cambio real. Al quitarlo, el cambio aparece.';
    default:
      return 'Con estos años no se ve un cambio claro. Quizá haga falta un registro más largo.';
  }
}
