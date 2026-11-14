import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ChartLegend, SeriesChart } from '@/components/vs/charts';
import { ScreenShell, Stepper } from '@/components/vs/shell';
import { Button, Card, Chip, Notice, Segmented, Toggle, Txt, useLayout } from '@/components/vs/ui';
import { VerdictCard } from '@/components/vs/verdict';
import { getVariable } from '@/data/variables';
import { decimalsFor, fmt, fmtP, runAnalysis, type Resolution } from '@/lib/analysis';
import type { IndexName } from '@/lib/simulate';
import { useSimulation } from '@/state/simulation';
import { useVsTheme } from '@/theme/theme-context';

const METHODS: Record<string, { title: string; text: string }> = {
  theil: {
    title: 'Pendiente de Theil-Sen (C4)',
    text: 'La tasa de cambio es la mediana de las pendientes entre todos los pares de meses. Resiste valores extremos (hasta 29 % de datos atípicos) y se expresa por década.',
  },
  hamed: {
    title: 'Mann-Kendall con corrección de Hamed-Rao (C5–C6)',
    text: 'Cuenta cuántos pares suben menos cuántos bajan. Como los meses consecutivos se parecen (autocorrelación), Hamed-Rao infla la varianza para no declarar tendencias de más.',
  },
  ic: {
    title: 'Intervalo de confianza coherente (C7)',
    text: 'Se calcula con la misma varianza corregida que la prueba: el intervalo excluye el cero si y solo si p < 0.05.',
  },
  nino: {
    title: 'Separar El Niño (C9–C10)',
    text: 'Se elige el rezago (0–6 meses) con mayor correlación con el índice y se ajusta tendencia e índice a la vez. La serie sin El Niño quita solo la parte explicada por el índice.',
  },
};

export default function Resultados() {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  const { state, set } = useSimulation();
  const variable = getVariable(state.variableId);
  const [which, setWhich] = useState<'A' | 'B'>('A');
  const [method, setMethod] = useState<string | null>(null);
  const [simple, setSimple] = useState(false);
  const region = which === 'A' || !state.dual ? state.regionA : state.regionB;

  const a = useMemo(
    () =>
      runAnalysis({
        variable,
        region,
        startYear: state.startYear,
        endYear: state.endYear,
        resolution: state.resolution,
        index: state.index,
      }),
    [variable, region, state.startYear, state.endYear, state.resolution, state.index],
  );
  const showSin = state.removeNino;
  const y = showSin ? a.sin : a.orig;
  const tr = showSin ? a.trendSin : a.trendOrig;
  const d = decimalsFor(variable.unit);
  const indexLabel = state.index === 'ONI' ? 'ONI (Niño 3.4)' : 'Niño 1+2';

  return (
    <ScreenShell>
      <Stepper current={2} />
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: isWide ? 1 : undefined, gap: 14, alignSelf: 'stretch' }}>
          <View style={{ gap: 4 }}>
            <Txt variant="h2">
              Anomalías de {variable.name.toLowerCase()} ({state.resolution})
            </Txt>
            <Txt variant="small" muted>
              {region.name} · {Math.max(state.startYear, variable.startYear)}–{state.endYear} · {variable.source}
            </Txt>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
            {state.dual && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Chip label="Región A" active={which === 'A'} color={theme.blue} onPress={() => setWhich('A')} />
                <Chip label="Región B" active={which === 'B'} color={theme.orange} onPress={() => setWhich('B')} />
              </View>
            )}
            <View style={{ width: 190 }}>
              <Segmented<Resolution>
                value={state.resolution}
                onChange={(r) => set({ resolution: r })}
                options={[
                  { value: 'mensual', label: 'Mensual' },
                  { value: 'anual', label: 'Anual' },
                ]}
              />
            </View>
            <View style={{ width: 190 }}>
              <Segmented<IndexName>
                value={state.index}
                onChange={(i) => set({ index: i })}
                options={[
                  { value: 'ONI', label: 'ONI' },
                  { value: 'N12', label: 'Niño 1+2' },
                ]}
              />
            </View>
          </View>

          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' }}>
              <ChartLegend
                items={[
                  { color: showSin ? theme.cyan : theme.blue, label: showSin ? 'Serie sin El Niño' : 'Serie', kind: 'dot' },
                  { color: theme.orange, label: 'Theil-Sen', kind: 'line' },
                  { color: theme.orange, label: 'IC 95 %', kind: 'box' },
                  { color: theme.orange, label: 'El Niño', kind: 'box' },
                  { color: theme.blue, label: 'La Niña', kind: 'box' },
                ]}
              />
              <View style={{ minWidth: 190 }}>
                <Toggle label="Quitar El Niño" value={state.removeNino} onChange={(v) => set({ removeNino: v })} />
              </View>
            </View>
            <SeriesChart
              t={a.t}
              y={y}
              ghost={showSin ? a.orig : undefined}
              color={showSin ? theme.cyan : theme.blue}
              trend={tr}
              bands={a.bands}
              yLabel={`Anomalía (${variable.unit})`}
              height={isWide ? 320 : 240}
            />
            <Txt variant="caption" muted>
              Resumen del gráfico: {a.t.length} {state.resolution === 'anual' ? 'años' : 'meses'}; la pendiente de Theil-Sen es{' '}
              {fmt(tr.slope * 10, d)} {variable.unit}/década ({fmtP(tr.p)}).
              {showSin ? ' La línea punteada gris es la serie original.' : ''}
            </Txt>
          </Card>

          {a.strongNinos.length > 0 && (
            <Notice icon="alert">
              Fase El Niño detectada en varios periodos ({a.strongNinos.join(', ')}).{' '}
              {state.removeNino ? 'Estás viendo la serie sin su influencia.' : 'Activa “Quitar El Niño” para ver la tendencia de fondo.'}
            </Notice>
          )}
          {a.warnings.map((w) => (
            <Notice key={w} icon="information-outline" color={theme.blue}>
              {w}
            </Notice>
          ))}

          <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 12 }}>
            <Card style={{ flex: 1, gap: 6 }}>
              <Txt variant="label" muted>
                Original vs sin El Niño
              </Txt>
              {[
                { label: 'Original', t: a.trendOrig },
                { label: 'Sin El Niño', t: a.trendSin },
              ].map((r) => (
                <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt variant="small">{r.label}</Txt>
                  <Txt variant="small" style={{ fontWeight: '700' }} color={r.t.p < 0.05 ? theme.green : theme.textSecondary}>
                    {fmt(r.t.slope * 10, d)} · {fmtP(r.t.p)}
                  </Txt>
                </View>
              ))}
            </Card>
            <Card style={{ flex: 1, gap: 6 }}>
              <Txt variant="label" muted>
                Vínculo con El Niño (C11)
              </Txt>
              <Txt variant="small">
                r = {a.ensoCorr.r.toFixed(2)} · rezago {a.lag} m · n efectivo {Math.round(a.ensoCorr.ne)}
              </Txt>
              <Txt variant="small" muted>
                {fmtP(a.ensoCorr.p)} (indicativo)
              </Txt>
            </Card>
            <Card style={{ flex: 1, gap: 6 }}>
              <Txt variant="label" muted>
                Antes y después (C16)
              </Txt>
              {a.delta ? (
                <>
                  <Txt variant="small">
                    Δ 1981–2001 → 2003+: {fmt(a.delta.orig, d)} {variable.unit}
                  </Txt>
                  <Txt variant="small" muted>
                    Sin El Niño: {fmt(a.delta.sin, d)} {variable.unit}
                  </Txt>
                </>
              ) : (
                <Txt variant="small" muted>
                  La ventana no cubre ambos periodos.
                </Txt>
              )}
              <Txt variant="caption" muted>
                Meses inusuales (|z|&gt;2): {a.unusual.total} · El Niño {a.unusual.nino} · La Niña {a.unusual.nina}
              </Txt>
            </Card>
          </View>
        </View>

        <View style={{ width: isWide ? 340 : undefined, alignSelf: 'stretch', gap: 12 }}>
          <VerdictCard a={a} variable={variable} showSin={showSin} indexName={indexLabel} simple={simple} />
          <Toggle label="Explícamelo simple" value={simple} onChange={setSimple} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label="Theil-Sen" active={method === 'theil'} onPress={() => setMethod(method === 'theil' ? null : 'theil')} />
            <Chip label="Hamed-Rao" active={method === 'hamed'} onPress={() => setMethod(method === 'hamed' ? null : 'hamed')} />
            <Chip label="IC 95 %" active={method === 'ic'} onPress={() => setMethod(method === 'ic' ? null : 'ic')} />
            <Chip label="¿Quitar El Niño?" active={method === 'nino'} onPress={() => setMethod(method === 'nino' ? null : 'nino')} />
          </View>
          {method && (
            <Card style={{ gap: 6 }}>
              <Txt variant="h3">{METHODS[method].title}</Txt>
              <Txt variant="small" muted>
                {METHODS[method].text}
              </Txt>
            </Card>
          )}
          <Button label="Comparar con otra región" iconLeft="compare-horizontal" variant="secondary" onPress={() => {
            set({ dual: true });
            router.navigate('/comparar');
          }} />
          <Button label="Nueva investigación" iconLeft="restart" variant="ghost" onPress={() => router.navigate('/explorar')} />
        </View>
      </View>
    </ScreenShell>
  );
}
