import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { ChartLegend, IndexChart, SeriesChart } from '@/components/vs/charts';
import { WorldMap } from '@/components/vs/maps';
import { ScreenShell } from '@/components/vs/shell';
import { Button, Card, Icon, Txt, useLayout } from '@/components/vs/ui';
import { DEFAULT_A, DEFAULT_B } from '@/data/regions';
import { getVariable } from '@/data/variables';
import { fmt, fmtP, runAnalysis, VERDICTS, type Analysis } from '@/lib/analysis';
import { getIndex, MONTHS } from '@/lib/simulate';
import { corrEffective } from '@/lib/stats';
import { useSimulation } from '@/state/simulation';
import { useVsTheme } from '@/theme/theme-context';

type Step = { title: string; text: string; info?: { term: string; text: string }; visual: ReactNode };

function InfoBox({ term, text }: { term: string; text: string }) {
  const { theme } = useVsTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 10, padding: 14, borderRadius: 14, backgroundColor: theme.primary + '1F', borderWidth: 1, borderColor: theme.primary + '55' }}>
      <Icon name="information" size={22} color={theme.primary} />
      <Txt variant="small" style={{ flex: 1 }}>
        <Txt variant="small" style={{ fontWeight: '800' }}>{term}: </Txt>
        {text}
      </Txt>
    </View>
  );
}

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  const { theme } = useVsTheme();
  return (
    <Card style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.orange }} />
        <Txt variant="h3">{title}</Txt>
      </View>
      {children}
    </Card>
  );
}

function useEspejo(): Step[] {
  const { theme } = useVsTheme();
  const rain = getVariable('V1');
  const t = MONTHS.map((m) => m.t);
  const oni = getIndex('ONI');
  const piura = useMemo(() => runAnalysis({ variable: rain, region: DEFAULT_A, startYear: 1981, endYear: 2024, resolution: 'mensual', index: 'N12' }), [rain]);
  const indo = useMemo(() => runAnalysis({ variable: rain, region: DEFAULT_B, startYear: 1981, endYear: 2024, resolution: 'mensual', index: 'ONI' }), [rain]);
  const mirror = corrEffective(piura.orig, indo.orig);
  const legend = <ChartLegend items={[{ color: theme.orange, label: 'El Niño', kind: 'box' }, { color: theme.blue, label: 'La Niña', kind: 'box' }]} />;
  return [
    {
      title: '¿Qué es El Niño?',
      text: 'Cada 2 a 7 años, las aguas del Pacífico ecuatorial se calientan más de lo normal. El índice ONI mide esa anomalía: por encima de +0.5 °C hablamos de El Niño; por debajo de −0.5 °C, de La Niña.',
      info: { term: 'Índice ONI', text: 'anomalía de temperatura del mar en la región Niño 3.4 (NOAA), media móvil de tres meses.' },
      visual: (
        <ChartCard title="Índice ONI (Niño 3.4)">
          <IndexChart t={t} values={oni} height={220} from={1991} />
        </ChartCard>
      ),
    },
    {
      title: 'El Pacífico se calienta',
      text: 'Durante El Niño, las aguas del Pacífico ecuatorial se calientan, alterando las lluvias en todo el mundo.',
      info: { term: 'Teleconexión', text: 'un cambio en una región afecta a otras distantes del planeta.' },
      visual: (
        <View style={{ gap: 12 }}>
          <WorldMap centerLon={-160} aspect={0.42} heat={1} />
          <ChartCard title="Índice ONI (Niño 3.4)">
            <IndexChart t={t} values={oni} height={150} from={1991} highlight={[2015, 2016.6]} />
          </ChartCard>
        </View>
      ),
    },
    {
      title: 'Piura: el desierto se inunda',
      text: `En la costa norte del Perú, los Niños intensos (1983, 1998, 2017, 2023) traen lluvias extraordinarias. La correlación de la lluvia con el índice Niño 1+2 es r = ${piura.ensoCorr.r.toFixed(2)} con ${piura.lag} ${piura.lag === 1 ? 'mes' : 'meses'} de rezago.`,
      info: { term: 'Anomalía', text: 'cuánto se aparta un mes de lo normal para ese mes del año. Así se elimina el ciclo de las estaciones.' },
      visual: (
        <ChartCard title="Lluvia · Costa norte del Perú (anomalía, mm/día)">
          {legend}
          <SeriesChart t={piura.t} y={piura.orig} color={theme.blue} bands={piura.bands} height={250} />
        </ChartCard>
      ),
    },
    {
      title: 'Indonesia y el norte de Australia: sequía',
      text: `Al otro lado del Pacífico ocurre lo contrario: con El Niño llueve menos. Las anomalías de ambas regiones tienen r = ${mirror.r.toFixed(2)} (n efectivo ${Math.round(mirror.ne)}, ${fmtP(mirror.p)}): se mueven en espejo.`,
      info: { term: 'Correlación no es causa', text: 'Piura no provoca la sequía de Indonesia; ambas responden al mismo océano.' },
      visual: (
        <View style={{ gap: 12 }}>
          <ChartCard title="Lluvia · Indonesia / N. Australia (anomalía, mm/día)">
            <SeriesChart t={indo.t} y={indo.orig} color={theme.orange} bands={indo.bands} height={200} />
          </ChartCard>
          <WorldMap
            aspect={0.3}
            centerLon={-160}
            markers={[
              { region: DEFAULT_A, label: 'A', color: theme.blue, shape: 'circle' },
              { region: DEFAULT_B, label: 'B', color: theme.orange, shape: 'square' },
            ]}
          />
        </View>
      ),
    },
    {
      title: '¿Y la tendencia de fondo?',
      text: 'VeraScope calcula la tendencia dos veces: con la serie original y con la serie sin El Niño. El veredicto sale de comparar ambas.',
      info: { term: 'Veredicto de cuatro estados', text: 'cambio robusto, sensible a El Niño, cambio oculto o sin tendencia detectable.' },
      visual: <VerdictPair a={piura} name="Lluvia · Costa norte del Perú" />,
    },
  ];
}

function useSenal(): Step[] {
  const { theme } = useVsTheme();
  const temp = getVariable('V2');
  const short = useMemo(() => runAnalysis({ variable: temp, region: DEFAULT_A, startYear: 2015, endYear: 2024, resolution: 'mensual', index: 'N12' }), [temp]);
  const full = useMemo(() => runAnalysis({ variable: temp, region: DEFAULT_A, startYear: 1981, endYear: 2024, resolution: 'mensual', index: 'N12' }), [temp]);
  return [
    {
      title: '10 años de temperatura',
      text: `Con solo 2015–2024 en la costa norte del Perú, la pendiente es ${fmt(short.trendOrig.slope * 10)} °C/década (${fmtP(short.trendOrig.p)}). Dos Niños fuertes (2015–16 y 2023) caen dentro de la ventana.`,
      info: { term: 'Potencia', text: 'con 10 años de datos mensuales, Mann-Kendall detecta una tendencia moderada solo ~14 % de las veces.' },
      visual: (
        <ChartCard title="Temperatura 2015–2024 (anomalía, °C)">
          <SeriesChart t={short.t} y={short.orig} color={theme.blue} trend={short.trendOrig} bands={short.bands} height={250} />
        </ChartCard>
      ),
    },
    {
      title: 'El registro completo',
      text: `Con 1981–2024 la pendiente es ${fmt(full.trendOrig.slope * 10)} °C/década (${fmtP(full.trendOrig.p)}), con un intervalo de [${(full.trendOrig.ciLow * 10).toFixed(2)}, ${(full.trendOrig.ciHigh * 10).toFixed(2)}].`,
      info: { term: 'IC 95 %', text: 'rango de pendientes compatibles con los datos. Si no incluye el cero, el cambio es significativo.' },
      visual: (
        <ChartCard title="Temperatura 1981–2024 (anomalía, °C)">
          <SeriesChart t={full.t} y={full.orig} color={theme.blue} trend={full.trendOrig} bands={full.bands} height={250} />
        </ChartCard>
      ),
    },
    {
      title: 'Quitamos El Niño',
      text: `Se ajusta la tendencia junto con el índice y se resta la parte de El Niño. Sin El Niño: ${fmt(full.trendSin.slope * 10)} °C/década (${fmtP(full.trendSin.p)}).`,
      info: { term: 'Autocorrelación', text: 'meses seguidos se parecen; Hamed-Rao lo corrige para no declarar tendencias de más.' },
      visual: (
        <ChartCard title="Temperatura sin El Niño (anomalía, °C)">
          <SeriesChart t={full.t} y={full.sin} ghost={full.orig} color={theme.cyan} trend={full.trendSin} bands={full.bands} height={250} />
        </ChartCard>
      ),
    },
    {
      title: '¿Señal real o ruido?',
      text: 'Una ventana corta puede mostrar una pendiente grande que no es significativa, o esconder una real. Un resultado “no significativo” es falta de evidencia, no ausencia de cambio.',
      visual: <VerdictPair a={full} name="Temperatura · Costa norte del Perú" />,
    },
  ];
}

function VerdictPair({ a, name }: { a: Analysis; name: string }) {
  const { theme } = useVsTheme();
  const v = VERDICTS[a.verdict];
  return (
    <Card style={{ gap: 12 }}>
      <Txt variant="h3">{name}</Txt>
      {[
        { label: 'Serie original', tr: a.trendOrig },
        { label: 'Serie sin El Niño', tr: a.trendSin },
      ].map((r) => (
        <View key={r.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Txt variant="body">{r.label}</Txt>
          <Txt variant="body" style={{ fontWeight: '700' }} color={r.tr.p < 0.05 ? theme.green : theme.textSecondary}>
            {fmt(r.tr.slope * 10)} /década · {fmtP(r.tr.p)}
          </Txt>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderRadius: 14, backgroundColor: v.color + '22' }}>
        <Icon name={v.icon} size={30} color={v.color} />
        <View style={{ flex: 1 }}>
          <Txt variant="h2" color={v.color}>
            {v.title}
          </Txt>
          <Txt variant="small" muted>
            {v.reading}
          </Txt>
        </View>
      </View>
    </Card>
  );
}

function EspejoDemo() {
  return <DemoView steps={useEspejo()} espejo />;
}

function SenalDemo() {
  return <DemoView steps={useSenal()} espejo={false} />;
}

export default function Demo() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return id === 'senal-o-ruido' ? <SenalDemo key={id} /> : <EspejoDemo key={id} />;
}

function DemoView({ steps, espejo }: { steps: Step[]; espejo: boolean }) {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  const { set } = useSimulation();
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  const tryIt = () => {
    set(
      espejo
        ? { variableId: 'V1', regionA: DEFAULT_A, regionB: DEFAULT_B, dual: true, startYear: 1981, endYear: 2024 }
        : { variableId: 'V2', regionA: DEFAULT_A, dual: false, startYear: 1981, endYear: 2024, index: 'N12' },
    );
    router.navigate('/explorar/region');
  };

  return (
    <ScreenShell>
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 20 }}>
        <View style={{ flex: isWide ? 1.25 : undefined, gap: 12 }}>
          <Txt variant="h1">{espejo ? 'El efecto espejo de El Niño' : '¿Señal real o ruido climático?'}</Txt>
          {step.visual}
        </View>
        <View style={{ flex: isWide ? 1 : undefined, gap: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Txt variant="h3">
              {i + 1} / {steps.length}
            </Txt>
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.surfaceStrong }}>
              <View style={{ width: `${((i + 1) / steps.length) * 100}%`, height: 6, borderRadius: 3, backgroundColor: theme.primary }} />
            </View>
          </View>
          <Txt variant="label" color={theme.cyan}>
            {step.title}
          </Txt>
          <Txt variant="h2" style={{ fontWeight: '500', lineHeight: 30 }}>
            {step.text}
          </Txt>
          {step.info && <InfoBox term={step.info.term} text={step.info.text} />}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="Anterior" iconLeft="arrow-left" variant="secondary" disabled={i === 0} onPress={() => setI(i - 1)} style={{ flex: 1 }} />
            {last ? (
              <Button label="Ahora hazlo tú" icon="arrow-right" variant="teal" onPress={tryIt} style={{ flex: 1 }} />
            ) : (
              <Button label="Siguiente" icon="arrow-right" onPress={() => setI(i + 1)} style={{ flex: 1 }} />
            )}
          </View>
          <Card onPress={() => router.replace({ pathname: '/demos/[id]', params: { id: espejo ? 'senal-o-ruido' : 'efecto-espejo' } })}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 52, height: 52, borderRadius: 12, backgroundColor: theme.surfaceStrong, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={espejo ? 'weather-hurricane' : 'earth'} size={30} color={theme.cyan} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="h3">{espejo ? '¿Señal real o ruido climático?' : 'El efecto espejo de El Niño'}</Txt>
                <Txt variant="small" muted>
                  {espejo ? 'Compara 10 años vs el registro completo' : 'Piura frente a Indonesia y Australia'}
                </Txt>
              </View>
              <Icon name="chevron-right" size={24} />
            </View>
          </Card>
        </View>
      </View>
    </ScreenShell>
  );
}
