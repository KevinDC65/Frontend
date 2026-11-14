import { router } from 'expo-router';
import { View } from 'react-native';

import { IndexChart } from '@/components/vs/charts';
import { Globe, WorldMap } from '@/components/vs/maps';
import { ScreenShell } from '@/components/vs/shell';
import { Button, Card, Icon, Txt, useLayout } from '@/components/vs/ui';
import { getIndex, MONTHS } from '@/lib/simulate';
import { useVsTheme } from '@/theme/theme-context';

const FEATURES = [
  { icon: 'satellite-variant', title: 'Datos', sub: 'NASA' },
  { icon: 'chart-bar', title: 'Análisis', sub: 'robusto' },
  { icon: 'school', title: 'Aprende', sub: 'investigando' },
];

export default function Landing() {
  const { theme } = useVsTheme();
  const { isWide, width } = useLayout();
  const globeSize = isWide ? Math.min(520, width * 0.42) : Math.min(340, width - 40);
  const oni = getIndex('ONI');
  const t = MONTHS.map((m) => m.t);

  return (
    <ScreenShell>
      <View style={{ flexDirection: isWide ? 'row' : 'column-reverse', alignItems: 'center', gap: 16 }}>
        <View style={{ flex: isWide ? 1.1 : undefined, gap: 18, alignSelf: 'stretch' }}>
          <Txt variant="label" color={theme.cyan}>
            Earth System Trend Detective
          </Txt>
          <Txt variant="hero">
            Descubre las tendencias de{'\n'}
            <Txt variant="hero" color={theme.cyan}>
              nuestro planeta
            </Txt>
          </Txt>
          <Txt variant="body" muted style={{ fontSize: 18, lineHeight: 26, maxWidth: 520 }}>
            Analiza datos satelitales de la NASA y explora el sistema terrestre: qué cambia, dónde, cuánto y si el cambio es
            significativo, separando la influencia de El Niño.
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <Button label="Comenzar investigación" icon="arrow-right" big onPress={() => router.navigate('/explorar')} />
            <Button label="Ver una demo" variant="secondary" big onPress={() => router.navigate({ pathname: '/demos/[id]', params: { id: 'efecto-espejo' } })} />
          </View>
          <View style={{ flexDirection: 'row', gap: 22, flexWrap: 'wrap', marginTop: 8 }}>
            {FEATURES.map((f) => (
              <View key={f.title} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: theme.surfaceStrong, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={f.icon} size={22} color={theme.cyan} />
                </View>
                <View>
                  <Txt variant="small" style={{ fontWeight: '700' }}>
                    {f.title}
                  </Txt>
                  <Txt variant="small" muted>
                    {f.sub}
                  </Txt>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View style={{ flex: isWide ? 1 : undefined, alignItems: 'center' }}>
          <Globe size={globeSize} />
        </View>
      </View>

      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16, marginTop: 28 }}>
        <Card onPress={() => router.navigate({ pathname: '/demos/[id]', params: { id: 'efecto-espejo' } })} style={{ flex: 1 }} padded={false}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '42%', padding: 10 }}>
              <WorldMap centerLon={-160} aspect={0.6} heat={1} rounded={12} />
            </View>
            <View style={{ flex: 1, padding: 14, gap: 6, justifyContent: 'center' }}>
              <Txt variant="h3">El efecto espejo de El Niño</Txt>
              <Txt variant="small" muted>
                Lluvia en Piura frente a Indonesia y el norte de Australia: un fenómeno global.
              </Txt>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Icon name="arrow-right-circle" size={26} color={theme.primary} />
              </View>
            </View>
          </View>
        </Card>
        <Card onPress={() => router.navigate({ pathname: '/demos/[id]', params: { id: 'senal-o-ruido' } })} style={{ flex: 1 }} padded={false}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ width: '42%', padding: 10, justifyContent: 'center' }}>
              <IndexChart t={t} values={oni} height={110} from={1995} />
            </View>
            <View style={{ flex: 1, padding: 14, gap: 6, justifyContent: 'center' }}>
              <Txt variant="h3">¿Señal real o ruido climático?</Txt>
              <Txt variant="small" muted>
                Temperatura: 10 años frente al registro completo. Descúbrelo aquí.
              </Txt>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <Icon name="arrow-right-circle" size={26} color={theme.primary} />
              </View>
            </View>
          </View>
        </Card>
      </View>
    </ScreenShell>
  );
}
