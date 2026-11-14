import { router } from 'expo-router';
import { View } from 'react-native';

import { ScreenShell } from '@/components/vs/shell';
import { Button, Txt } from '@/components/vs/ui';

export default function NotFound() {
  return (
    <ScreenShell>
      <View style={{ alignItems: 'center', gap: 14, paddingVertical: 60 }}>
        <Txt variant="h1">Esta página no existe</Txt>
        <Txt variant="body" muted>
          Vuelve al inicio para seguir explorando.
        </Txt>
        <Button label="Ir al inicio" onPress={() => router.navigate('/')} />
      </View>
    </ScreenShell>
  );
}
