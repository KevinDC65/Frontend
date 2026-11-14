import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, TextInput, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { ScreenShell, Stepper } from '@/components/vs/shell';
import { Badge, Button, Card, Chip, Divider, Icon, Txt, useLayout } from '@/components/vs/ui';
import { LAYER_LABEL, SPHERES, VARIABLES, type Sphere, type Variable } from '@/data/variables';
import { useSimulation } from '@/state/simulation';
import { useVsTheme } from '@/theme/theme-context';

const SPHERE_COLORS: Record<Sphere, [string, string]> = {
  atmosfera: ['#60A5FA', '#1E3A8A'],
  hidrosfera: ['#22D3EE', '#0E7490'],
  biosfera: ['#4ADE80', '#166534'],
  oceano: ['#F28C38', '#7C2D12'],
};

function VarArt({ v, size = 92 }: { v: Variable; size?: number }) {
  const [c1, c2] = SPHERE_COLORS[v.sphere];
  return (
    <View style={{ width: size, height: size, borderRadius: 14, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`g${v.id}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="1" stopColor={c2} />
          </LinearGradient>
        </Defs>
        <Rect width={size} height={size} fill={`url(#g${v.id})`} />
      </Svg>
      <Icon name={v.icon} size={size * 0.45} color="#fff" />
    </View>
  );
}

function ResolutionChips() {
  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
      <Chip label="Diaria" small disabled />
      <Chip label="Mensual" small active />
      <Chip label="Anual" small />
    </View>
  );
}

function Detail({ v, onUse }: { v: Variable; onUse: () => void }) {
  const { theme } = useVsTheme();
  return (
    <View style={{ gap: 10 }}>
      <VarArt v={v} size={120} />
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Badge label={v.status} tone={v.status === 'DECIDIDO' ? 'blue' : 'red'} />
        <Badge label={LAYER_LABEL[v.layer]} tone="gray" />
      </View>
      <Txt variant="h2">{v.name}</Txt>
      <Txt variant="small" muted>
        {v.description}
      </Txt>
      <Txt variant="small">
        <Txt variant="small" style={{ fontWeight: '700' }}>Fuente: </Txt>
        {v.source} · {v.id} {v.code}
      </Txt>
      <Txt variant="small">
        <Txt variant="small" style={{ fontWeight: '700' }}>Unidad: </Txt>
        {v.unit} · desde {v.startYear}
      </Txt>
      <Divider />
      <Txt variant="label" muted>
        Respuesta esperada a El Niño
      </Txt>
      <Txt variant="small">{v.ensoResponse}</Txt>
      <Txt variant="caption" muted>
        Funciones que la usan: {v.proposals}
      </Txt>
      <Txt variant="label" muted style={{ marginTop: 4 }}>
        Resoluciones
      </Txt>
      <ResolutionChips />
      <Txt variant="caption" muted>
        Mensual: recomendada para identificar tendencias (evita el ciclo diario y da potencia suficiente).
      </Txt>
      {v.analyzable ? (
        <Button label="Usar esta variable" icon="arrow-right" variant="teal" onPress={onUse} style={{ marginTop: 6 }} />
      ) : (
        <View style={{ padding: 10, borderRadius: 12, backgroundColor: theme.surfaceStrong }}>
          <Txt variant="small" muted>
            {v.layer === 'covariable'
              ? 'Es una covariable: se usa para separar El Niño de la tendencia, no se analiza sola.'
              : 'Solo se muestra como contexto: no se correlaciona ni se analiza.'}
          </Txt>
        </View>
      )}
    </View>
  );
}

export default function Catalogo() {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  const { state, set } = useSimulation();
  const [query, setQuery] = useState('');
  const [sphere, setSphere] = useState<Sphere | 'todas'>('todas');
  const [selected, setSelected] = useState(state.variableId);
  const [sheet, setSheet] = useState(false);

  const list = VARIABLES.filter(
    (v) =>
      (sphere === 'todas' || v.sphere === sphere) &&
      (v.name + v.code + v.description + v.source).toLowerCase().includes(query.trim().toLowerCase()),
  );
  const current = VARIABLES.find((v) => v.id === selected) ?? VARIABLES[0];

  const use = (v: Variable) => {
    set({ variableId: v.id, startYear: Math.max(state.startYear, v.startYear) });
    setSheet(false);
    router.navigate('/explorar/region');
  };

  return (
    <ScreenShell>
      <Stepper current={0} />
      <Txt variant="h1">Explora variables terrestres</Txt>
      <Txt variant="body" muted style={{ marginTop: 4, marginBottom: 16 }}>
        Paso 1 de 3: selecciona una variable de nuestro catálogo de datos NASA.
      </Txt>

      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 12, alignItems: isWide ? 'center' : 'stretch', marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderWidth: 1,
            borderColor: theme.border,
            backgroundColor: theme.surface,
            borderRadius: 14,
            paddingHorizontal: 12,
            minWidth: isWide ? 320 : undefined,
          }}>
          <Icon name="magnify" size={20} color={theme.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar variable..."
            placeholderTextColor={theme.textMuted}
            style={{ flex: 1, color: theme.text, paddingVertical: 10, fontSize: 15 }}
            accessibilityLabel="Buscar variable"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {SPHERES.map((s) => (
            <Chip key={s.id} label={s.label} active={sphere === s.id} onPress={() => setSphere(s.id)} />
          ))}
        </ScrollView>
      </View>

      <View style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
        {isWide && (
          <Card style={{ width: 130, gap: 6, padding: 8 }}>
            {SPHERES.filter((s) => s.id !== 'todas').map((s) => {
              const active = sphere === s.id;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => setSphere(active ? 'todas' : s.id)}
                  style={{ alignItems: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: active ? theme.surfaceSelected : 'transparent', gap: 6 }}>
                  <Icon name={s.icon} size={28} color={active ? theme.primary : theme.textSecondary} />
                  <Txt variant="caption" style={{ fontWeight: '700', letterSpacing: 0.6 }} color={active ? theme.primary : theme.textSecondary}>
                    {s.label.toUpperCase()}
                  </Txt>
                </Pressable>
              );
            })}
          </Card>
        )}

        <View style={{ flex: 1, gap: 12 }}>
          {list.length === 0 && (
            <Card>
              <Txt variant="body" muted>
                No hay variables que coincidan con “{query}”.
              </Txt>
            </Card>
          )}
          {list.map((v) => (
            <Card
              key={v.id}
              selected={v.id === selected}
              onPress={() => {
                setSelected(v.id);
                if (!isWide) setSheet(true);
              }}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <VarArt v={v} size={isWide ? 96 : 72} />
                <View style={{ flex: 1, gap: 4 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Txt variant="h3">{v.name}</Txt>
                    {v.status === 'PROPUESTO' && <Badge label="PROPUESTO" tone="red" />}
                    {!v.analyzable && <Badge label={LAYER_LABEL[v.layer]} tone="orange" />}
                  </View>
                  <Txt variant="small" muted numberOfLines={2}>
                    {v.description}
                  </Txt>
                  <Txt variant="caption" muted>
                    Fuente: {v.source} · Unidad: {v.unit}
                  </Txt>
                  {isWide && (
                    <View style={{ marginTop: 4 }}>
                      <ResolutionChips />
                    </View>
                  )}
                </View>
              </View>
            </Card>
          ))}
        </View>

        {isWide && (
          <Card style={{ width: 300 }}>
            <Detail v={current} onUse={() => use(current)} />
          </Card>
        )}
      </View>

      <Modal visible={!isWide && sheet} transparent animationType="slide" onRequestClose={() => setSheet(false)}>
        <Pressable style={{ flex: 1, backgroundColor: theme.overlay }} onPress={() => setSheet(false)} />
        <View
          style={{
            backgroundColor: theme.name === 'dark' ? '#0B1B3F' : '#fff',
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
            padding: 20,
            maxHeight: '85%',
          }}>
          <ScrollView>
            <Detail v={current} onUse={() => use(current)} />
          </ScrollView>
        </View>
      </Modal>
    </ScreenShell>
  );
}
