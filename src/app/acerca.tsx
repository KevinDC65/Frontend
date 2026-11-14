import { View } from 'react-native';

import { ScreenShell } from '@/components/vs/shell';
import { Badge, Card, Icon, Txt, useLayout } from '@/components/vs/ui';
import { useVsTheme } from '@/theme/theme-context';

const PROPOSALS: [string, string, string, boolean][] = [
  ['P1', 'Veredicto de la investigación guiada', 'Simulado en Resultados', true],
  ['P2', 'Interruptor “Quitar El Niño”', 'Simulado en Resultados y Comparar', true],
  ['P3', 'ScanMap (4235 celdas, corrección FDR)', 'Próximamente', true],
  ['P4', 'Líneas causa → consecuencia', 'Versión simple en Comparar', true],
  ['P5', 'Comparador en el tiempo', 'Δ entre periodos y meses inusuales en Resultados', true],
  ['P6', 'Panel Causa · Consecuencia · Realidad', 'Próximamente', true],
  ['P7', 'Demo 1 · El efecto espejo de El Niño', 'Simulado', true],
  ['P8', 'Demo 2 · ¿Señal real o ruido climático?', 'Simulado', true],
  ['P9', 'Contraste entre fuentes (MERRA-2 vs GPM/GLDAS)', 'Propuesto', false],
  ['P10', 'Cambios bruscos (Pettitt)', 'Propuesto', false],
  ['P11', 'Frecuencia de extremos', 'Propuesto', false],
];

const SOURCES = [
  ['Capa en vivo', 'NASA POWER (MERRA-2): lluvia, temperatura, humedad del suelo y relativa. Celda de 0.5°, desde 1981.'],
  ['Covariables', 'NOAA CPC: ONI (Niño 3.4) y Niño 1+2.'],
  ['Capa precalculada', 'GPM IMERG (desde 1998), GLDAS Noah y MODIS NDVI (desde 2000).'],
  ['Contexto', 'CO₂ de Mauna Loa (NOAA GML): solo franja de contexto, sin cálculos.'],
];

const LIMITS = [
  ['Linealidad', 'La tendencia y la respuesta a El Niño se suponen lineales.'],
  ['Niño costero', 'El ONI mide el Pacífico central; para Piura, Niño 1+2 capta eventos como el de 2017.'],
  ['Reanálisis', 'MERRA-2 combina observaciones y modelo; con pocas estaciones su lluvia es menos confiable.'],
  ['Escala', 'Una celda de 0.5° mide unos 55 km de lado; la escorrentía no equivale al caudal de un río.'],
  ['Correlación no es causa', 'Las líneas indican que dos lugares responden a la vez al mismo índice.'],
  ['Selección de rezago', 'Elegir el mejor de siete rezagos infla un poco la correlación: se informa como indicativa.'],
];

export default function Acerca() {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  return (
    <ScreenShell>
      <Txt variant="h1">Acerca de VeraScope</Txt>
      <Txt variant="body" muted style={{ marginTop: 4, marginBottom: 16, maxWidth: 760 }}>
        VeraScope permite investigar con datos de la NASA qué cambia en el sistema terrestre, dónde, cuánto y si el cambio es
        estadísticamente significativo, separando la influencia de El Niño de la tendencia de fondo.
      </Txt>

      <Card style={{ gap: 6, marginBottom: 16, borderColor: theme.amber + '88' }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Icon name="flask-outline" size={20} color={theme.amber} />
          <Txt variant="h3">Esta es una simulación</Txt>
        </View>
        <Txt variant="small" muted>
          Las series se generan con el modelo del informe (estación + tendencia + respuesta a El Niño + ruido con memoria) y los eventos
          históricos aproximados de El Niño. Los cálculos (anomalías, Theil-Sen, Mann-Kendall con Hamed-Rao, IC coherente, rezago,
          regresión conjunta y veredicto) se ejecutan de verdad sobre esas series, pero los números no son datos reales de la NASA.
        </Txt>
      </Card>

      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>
        <Card style={{ flex: 1.2, gap: 10 }}>
          <Txt variant="h2">Funciones del producto</Txt>
          {PROPOSALS.map(([id, name, status, decided]) => (
            <View key={id} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Txt variant="small" style={{ fontWeight: '800', width: 34 }} color={theme.primary}>
                {id}
              </Txt>
              <View style={{ flex: 1 }}>
                <Txt variant="small" style={{ fontWeight: '600' }}>
                  {name}
                </Txt>
                <Txt variant="caption" muted>
                  {status}
                </Txt>
              </View>
              <Badge label={decided ? 'DECIDIDO' : 'PROPUESTO'} tone={decided ? 'blue' : 'red'} />
            </View>
          ))}
        </Card>
        <View style={{ flex: 1, gap: 16 }}>
          <Card style={{ gap: 10 }}>
            <Txt variant="h2">Fuentes de datos</Txt>
            {SOURCES.map(([k, v]) => (
              <Txt key={k} variant="small">
                <Txt variant="small" style={{ fontWeight: '700' }}>{k}: </Txt>
                {v}
              </Txt>
            ))}
          </Card>
          <Card style={{ gap: 10 }}>
            <Txt variant="h2">Limitaciones</Txt>
            {LIMITS.map(([k, v]) => (
              <Txt key={k} variant="small">
                <Txt variant="small" style={{ fontWeight: '700' }}>{k}. </Txt>
                {v}
              </Txt>
            ))}
          </Card>
        </View>
      </View>
    </ScreenShell>
  );
}
