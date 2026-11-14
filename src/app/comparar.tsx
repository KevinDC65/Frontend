import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { domainOf, SeriesChart } from '@/components/vs/charts';
import { WorldMap } from '@/components/vs/maps';
import { ScreenShell } from '@/components/vs/shell';
import { Button, Card, Chip, Icon, Segmented, Toggle, Txt, useLayout } from '@/components/vs/ui';
import { END_YEAR, getVariable, VARIABLES } from '@/data/variables';
import { decimalsFor, fmt, fmtP, runAnalysis, VERDICTS, type Analysis, type Resolution } from '@/lib/analysis';
import { corrEffective } from '@/lib/stats';
import { useSimulation } from '@/state/simulation';
import { useVsTheme } from '@/theme/theme-context';

function RegionPanel({
  label,
  name,
  color,
  a,
  yDomain,
  unit,
  showSin,
}: {
  label: string;
  name: string;
  color: string;
  a: Analysis;
  yDomain?: [number, number];
  unit: string;
  showSin: boolean;
}) {
  const { theme } = useVsTheme();
  const tr = showSin ? a.trendSin : a.trendOrig;
  const sig = tr.p < 0.05;
  const d = decimalsFor(unit);
  const v = VERDICTS[a.verdict];
  return (
    <Card style={{ flex: 1, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: color }} />
        <Txt variant="h3" style={{ flex: 1 }} numberOfLines={1}>
          Región {label}: {name}
        </Txt>
      </View>
      <SeriesChart t={a.t} y={showSin ? a.sin : a.orig} color={color} trend={tr} yDomain={yDomain} bands={a.bands} height={220} dots />
      <View style={{ alignItems: 'center', gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name={sig ? 'check-circle' : 'minus-circle-outline'} size={18} color={sig ? theme.green : theme.textMuted} />
          <Txt variant="h3">{sig ? `Tendencia ${tr.slope > 0 ? 'al alza' : 'a la baja'} significativa` : 'Tendencia no significativa'}</Txt>
        </View>
        <Txt variant="small" muted>
          ({fmt(tr.slope * 10, d)} {unit}/década · {fmtP(tr.p)})
        </Txt>
        <Txt variant="small" color={v.color} style={{ fontWeight: '700' }}>
          Veredicto: {v.title}
        </Txt>
      </View>
    </Card>
  );
}

export default function Comparar() {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  const { state, set } = useSimulation();
  const [sync, setSync] = useState(true);
  const variable = getVariable(state.variableId);

  const { startYear, endYear, resolution, index, regionA, regionB } = state;
  const aA = useMemo(
    () => runAnalysis({ variable, startYear, endYear, resolution, index, region: regionA }),
    [variable, startYear, endYear, resolution, index, regionA],
  );
  const aB = useMemo(
    () => runAnalysis({ variable, startYear, endYear, resolution, index, region: regionB }),
    [variable, startYear, endYear, resolution, index, regionB],
  );
  const showSin = state.removeNino;
  const yDomain = sync ? domainOf(showSin ? [aA.sin, aB.sin] : [aA.orig, aB.orig]) : undefined;
  const mirror = corrEffective(aA.orig, aB.orig);
  const mirrorSig = mirror.p < 0.05;

  return (
    <ScreenShell>
      <Txt variant="h1">Compara dos regiones</Txt>
      <Txt variant="body" muted style={{ marginTop: 4, marginBottom: 14 }}>
        La misma variable, el mismo periodo y la misma escala: ¿responden igual o en espejo?
      </Txt>

      <View style={{ gap: 10, marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt variant="small" style={{ fontWeight: '700' }}>
            Variable:
          </Txt>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {VARIABLES.filter((v) => v.analyzable).map((v) => (
              <Chip
                key={v.id}
                small
                label={v.short}
                active={v.id === state.variableId}
                onPress={() => set({ variableId: v.id, startYear: Math.max(state.startYear, v.startYear) })}
              />
            ))}
          </ScrollView>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <Txt variant="small" style={{ fontWeight: '700' }}>
            Resolución:
          </Txt>
          <View style={{ width: 180 }}>
            <Segmented<Resolution>
              value={state.resolution}
              onChange={(r) => set({ resolution: r })}
              options={[
                { value: 'mensual', label: 'Mensual' },
                { value: 'anual', label: 'Anual' },
              ]}
            />
          </View>
          <Txt variant="small" style={{ fontWeight: '700' }}>
            Periodo:
          </Txt>
          {[
            [1991, END_YEAR],
            [1981, END_YEAR],
            [2005, END_YEAR],
          ].map(([s, e]) => (
            <Chip key={s} small label={`${Math.max(s, variable.startYear)} – ${e}`} active={state.startYear === s && state.endYear === e} onPress={() => set({ startYear: s, endYear: e })} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
          <View style={{ minWidth: 220 }}>
            <Toggle label="Escalas sincronizadas" value={sync} onChange={setSync} />
          </View>
          <View style={{ minWidth: 220 }}>
            <Toggle label="Quitar El Niño" value={state.removeNino} onChange={(v) => set({ removeNino: v })} />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 14 }}>
        <RegionPanel label="A" name={state.regionA.name} color={theme.blue} a={aA} yDomain={yDomain} unit={variable.unit} showSin={showSin} />
        <RegionPanel label="B" name={state.regionB.name} color={theme.orange} a={aB} yDomain={yDomain} unit={variable.unit} showSin={showSin} />
      </View>

      <Card style={{ marginTop: 14, gap: 12 }} padded>
        <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16, alignItems: isWide ? 'center' : 'stretch' }}>
          <View style={{ flex: 1.4 }}>
            <WorldMap
              aspect={0.32}
              markers={[
                { region: state.regionA, label: 'A', color: theme.blue, shape: 'circle' },
                { region: state.regionB, label: 'B', color: theme.orange, shape: 'square' },
              ]}
            />
          </View>
          <View style={{ flex: 1, gap: 6 }}>
            <Txt variant="label" muted>
              Líneas causa → consecuencia (P4 · C11)
            </Txt>
            <Txt variant="h3" color={mirrorSig && mirror.r < 0 ? theme.orange : theme.text}>
              {mirrorSig ? (mirror.r < 0 ? 'Se mueven en espejo' : 'Se mueven juntas') : 'Sin vínculo claro'}
            </Txt>
            <Txt variant="small" muted>
              Correlación de anomalías r = {mirror.r.toFixed(2)} con n efectivo {Math.round(mirror.ne)} ({fmtP(mirror.p)}). Correlación no es causa:
              indica que ambas responden a la vez, por ejemplo al mismo índice de El Niño.
            </Txt>
            {sync && (
              <View style={{ alignSelf: 'flex-start', flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: theme.green + '22', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
                <Txt variant="caption" color={theme.green} style={{ fontWeight: '700' }}>
                  Escalas sincronizadas ✓
                </Txt>
              </View>
            )}
          </View>
        </View>
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        <Button label="Cambiar regiones" iconLeft="map-marker-radius" variant="secondary" onPress={() => router.navigate('/explorar/region')} />
        <Button label="Ver detalle estadístico" icon="arrow-right" onPress={() => router.navigate('/explorar/resultados')} />
      </View>
    </ScreenShell>
  );
}
