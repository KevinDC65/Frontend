import { router } from 'expo-router';
import { View } from 'react-native';

import { IndexChart } from '@/components/vs/charts';
import { WorldMap } from '@/components/vs/maps';
import { ScreenShell } from '@/components/vs/shell';
import { Badge, Button, Card, Txt, useLayout } from '@/components/vs/ui';
import { getIndex, MONTHS } from '@/lib/simulate';

export default function Demos() {
  const { isWide } = useLayout();
  return (
    <ScreenShell>
      <Txt variant="h1">Demostraciones guiadas</Txt>
      <Txt variant="body" muted style={{ marginTop: 4, marginBottom: 16 }}>
        Recorridos paso a paso para aprender a investigar con datos antes de hacerlo por tu cuenta.
      </Txt>
      <View style={{ flexDirection: isWide ? 'row' : 'column', gap: 16 }}>
        <Card style={{ flex: 1, gap: 12 }}>
          <WorldMap centerLon={-160} aspect={0.42} heat={1} />
          <Badge label="DEMO 1 · P7 · 5 PASOS" />
          <Txt variant="h2">El efecto espejo de El Niño</Txt>
          <Txt variant="small" muted>
            Lluvia de Piura frente a Indonesia y el norte de Australia: la misma causa, efectos opuestos a miles de kilómetros.
          </Txt>
          <Button label="Comenzar" icon="arrow-right" onPress={() => router.navigate({ pathname: '/demos/[id]', params: { id: 'efecto-espejo' } })} />
        </Card>
        <Card style={{ flex: 1, gap: 12 }}>
          <IndexChart t={MONTHS.map((m) => m.t)} values={getIndex('N12')} height={isWide ? 200 : 150} from={1985} />
          <Badge label="DEMO 2 · P8 · 4 PASOS" />
          <Txt variant="h2">¿Señal real o ruido climático?</Txt>
          <Txt variant="small" muted>
            Temperatura con 10 años frente al registro completo: por qué la longitud de la serie y El Niño cambian la conclusión.
          </Txt>
          <Button label="Comenzar" icon="arrow-right" onPress={() => router.navigate({ pathname: '/demos/[id]', params: { id: 'senal-o-ruido' } })} />
        </Card>
      </View>
    </ScreenShell>
  );
}
