import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { WorldMap } from '@/components/vs/maps';
import { ScreenShell, Stepper } from '@/components/vs/shell';
import { Button, Card, Chip, Icon, Segmented, Toggle, Txt, useLayout } from '@/components/vs/ui';
import { customRegion, PRESET_REGIONS } from '@/data/regions';
import { END_YEAR, getVariable } from '@/data/variables';
import type { Resolution } from '@/lib/analysis';
import { useSimulation } from '@/state/simulation';
import { useVsTheme } from '@/theme/theme-context';

const TOOLS = [
  { id: 'pointer', icon: 'cursor-default', label: 'Seleccionar' },
  { id: 'circle', icon: 'circle-outline', label: 'Punto' },
  { id: 'polygon', icon: 'pentagon-outline', label: 'Polígono' },
  { id: 'rect', icon: 'square-outline', label: 'Rectángulo' },
];

function YearStepper({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min: number; max: number }) {
  const { theme } = useVsTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: theme.border, borderRadius: 12, backgroundColor: theme.surfaceStrong }}>
      <Pressable onPress={() => onChange(Math.max(min, value - 1))} style={{ padding: 8 }} accessibilityLabel="Restar un año">
        <Icon name="chevron-left" size={20} />
      </Pressable>
      <Txt variant="h3" style={{ minWidth: 46, textAlign: 'center' }}>
        {value}
      </Txt>
      <Pressable onPress={() => onChange(Math.min(max, value + 1))} style={{ padding: 8 }} accessibilityLabel="Sumar un año">
        <Icon name="chevron-right" size={20} />
      </Pressable>
    </View>
  );
}

export default function RegionScreen() {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  const { state, set } = useSimulation();
  const variable = getVariable(state.variableId);
  const [tool, setTool] = useState('circle');
  const [target, setTarget] = useState<'A' | 'B'>('A');
  const [loading, setLoading] = useState(false);

  const years = state.endYear - state.startYear + 1;
  const valid = years >= 10;

  const pick = (lat: number, lon: number) => {
    if (tool === 'pointer') return;
    const r = customRegion(lat, lon);
    if (target === 'A' || !state.dual) set({ regionA: r });
    else set({ regionB: r });
  };

  const analyze = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.navigate(state.dual ? '/comparar' : '/explorar/resultados');
    }, 900);
  };

  const markers = [
    { region: state.regionA, label: 'A', color: theme.blue, shape: 'circle' as const },
    ...(state.dual ? [{ region: state.regionB, label: 'B', color: theme.orange, shape: 'square' as const }] : []),
  ];

  const mapPanel = (
    <Card style={{ flex: 1, gap: 12 }}>
      <Txt variant="h3">Selecciona tu región en el mapa</Txt>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ gap: 8 }}>
          {TOOLS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTool(t.id)}
              accessibilityLabel={t.label}
              accessibilityState={{ selected: tool === t.id }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: tool === t.id ? theme.primary : theme.border,
                backgroundColor: tool === t.id ? theme.surfaceSelected : theme.surfaceStrong,
              }}>
              <Icon name={t.icon} size={20} color={tool === t.id ? theme.primary : theme.text} />
            </Pressable>
          ))}
        </View>
        <View style={{ flex: 1 }}>
          <WorldMap markers={markers} onPick={pick} aspect={0.52} />
        </View>
      </View>
      {state.dual && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Txt variant="small" muted>
            Al tocar el mapa colocas:
          </Txt>
          <Chip label="Región A" active={target === 'A'} color={theme.blue} onPress={() => setTarget('A')} />
          <Chip label="Región B" active={target === 'B'} color={theme.orange} onPress={() => setTarget('B')} />
        </View>
      )}
      <Txt variant="caption" muted>
        {tool === 'pointer'
          ? 'Herramienta de selección: elige otra herramienta para marcar una región.'
          : 'Toca el mapa para ubicar la celda de 0.5° a analizar, o usa una región predefinida.'}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {PRESET_REGIONS.map((r) => {
          const isA = state.regionA.id === r.id;
          const isB = state.dual && state.regionB.id === r.id;
          return (
            <Chip
              key={r.id}
              label={r.name}
              small
              active={isA || isB}
              color={isB ? theme.orange : theme.blue}
              onPress={() => (target === 'A' || !state.dual ? set({ regionA: r }) : set({ regionB: r }))}
            />
          );
        })}
      </View>
      <View style={{ gap: 4 }}>
        <Txt variant="small">
          <Txt variant="small" style={{ fontWeight: '700' }} color={theme.blue}>A · </Txt>
          {state.regionA.name} ({state.regionA.lat.toFixed(1)}°, {state.regionA.lon.toFixed(1)}°)
        </Txt>
        {state.dual && (
          <Txt variant="small">
            <Txt variant="small" style={{ fontWeight: '700' }} color={theme.orange}>B · </Txt>
            {state.regionB.name} ({state.regionB.lat.toFixed(1)}°, {state.regionB.lon.toFixed(1)}°)
          </Txt>
        )}
      </View>
    </Card>
  );

  const side = (
    <Card style={{ width: isWide ? 330 : undefined, gap: 14 }}>
      <View style={{ gap: 4 }}>
        <Txt variant="small" muted>
          Variable seleccionada
        </Txt>
        <Pressable onPress={() => router.navigate('/explorar')} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Icon name={variable.icon} size={22} color={theme.primary} />
          <Txt variant="h3" style={{ flex: 1 }}>
            {variable.name}
          </Txt>
          <Txt variant="caption" color={theme.primary}>
            Cambiar
          </Txt>
        </Pressable>
      </View>
      <View style={{ gap: 6 }}>
        <Txt variant="small" style={{ fontWeight: '700' }}>
          Resolución temporal
        </Txt>
        <Segmented<Resolution | 'diaria'>
          value={state.resolution}
          onChange={(r) => r !== 'diaria' && set({ resolution: r })}
          options={[
            { value: 'diaria', label: 'Diaria', disabled: true },
            { value: 'mensual', label: 'Mensual' },
            { value: 'anual', label: 'Anual' },
          ]}
        />
        <Txt variant="caption" muted>
          <Txt variant="caption" color={theme.primary}>Mensual: </Txt>
          recomendado para identificar tendencias. La escala diaria no se usa (ver informe, sección 2).
        </Txt>
      </View>
      <View style={{ gap: 8 }}>
        <Txt variant="small" style={{ fontWeight: '700' }}>
          Rango de años (≥ 10 años)
        </Txt>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <YearStepper value={state.startYear} min={variable.startYear} max={END_YEAR - 1} onChange={(v) => set({ startYear: v })} />
          <Txt variant="body">—</Txt>
          <YearStepper value={state.endYear} min={state.startYear + 1} max={END_YEAR} onChange={(v) => set({ endYear: v })} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name={valid ? 'check' : 'alert-circle'} size={16} color={valid ? theme.green : theme.red} />
          <Txt variant="caption" color={valid ? theme.green : theme.red}>
            {years} años · {valid ? 'rango válido' : 'mínimo 10 años (120 meses)'}
          </Txt>
        </View>
        {valid && years < 20 && (
          <Txt variant="caption" color={theme.amber}>
            Menos de 20 años: la potencia para detectar tendencias moderadas es baja.
          </Txt>
        )}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {[10, 20, 30].map((n) => (
            <Chip key={n} small label={`Últimos ${n}`} onPress={() => set({ startYear: Math.max(variable.startYear, END_YEAR - n + 1), endYear: END_YEAR })} />
          ))}
          <Chip small label="Todo" onPress={() => set({ startYear: variable.startYear, endYear: END_YEAR })} />
        </View>
      </View>
      <Toggle label="Modo comparación dual" value={state.dual} onChange={(v) => set({ dual: v })} />
      <Button
        label={loading ? 'Calculando…' : 'Analizar tendencia'}
        icon={loading ? undefined : 'arrow-right'}
        disabled={!valid || loading}
        onPress={analyze}
        big
      />
      {loading && (
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <ActivityIndicator color={theme.primary} />
          <Txt variant="caption" muted>
            Anomalías · rezago · regresión conjunta · Theil-Sen · Mann-Kendall Hamed-Rao…
          </Txt>
        </View>
      )}
    </Card>
  );

  return (
    <ScreenShell>
      <Stepper current={1} />
      <Txt variant="body" muted style={{ marginBottom: 12 }}>
        Paso 2 de 3: elige dónde y cuándo.
      </Txt>
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
        <View style={{ flex: isWide ? 1 : undefined, alignSelf: 'stretch' }}>{mapPanel}</View>
        <View style={{ alignSelf: 'stretch' }}>{side}</View>
      </View>
    </ScreenShell>
  );
}
