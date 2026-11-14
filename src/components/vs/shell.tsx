import { router, usePathname, type Href } from 'expo-router';
import { useMemo, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { mulberry32 } from '@/lib/simulate';
import { useVsTheme } from '@/theme/theme-context';

import { Icon, Txt, useLayout } from './ui';

export function Logo({ compact }: { compact?: boolean }) {
  const { theme } = useVsTheme();
  return (
    <Pressable
      onPress={() => router.navigate('/')}
      accessibilityRole="link"
      accessibilityLabel="VeraScope, inicio"
      style={styles.logo}>
      <Svg width={34} height={34} viewBox="0 0 40 40">
        <Defs>
          <RadialGradient id="lg" cx="40%" cy="35%" r="70%">
            <Stop offset="0" stopColor="#7DD3FC" />
            <Stop offset="0.6" stopColor="#1D7FE0" />
            <Stop offset="1" stopColor="#0B1B3F" />
          </RadialGradient>
        </Defs>
        <Circle cx={18} cy={18} r={12} fill="url(#lg)" />
        <Path d="M10 15 q5 -4 9 0 t8 1 M9 21 q6 3 10 -1 t9 2" stroke="#9BE7C4" strokeWidth={1.6} fill="none" />
        <Ellipse cx={18} cy={18} rx={17} ry={6} stroke={theme.cyan} strokeWidth={1.6} fill="none" transform="rotate(-25 18 18)" />
        <Path d="M27 27 L36 36" stroke={theme.text} strokeWidth={3} strokeLinecap="round" />
      </Svg>
      {!compact && (
        <View>
          <Txt variant="h3" style={{ fontSize: 19 }}>
            Vera<Txt variant="h3" style={{ fontSize: 19 }} color={theme.blue}>Scope</Txt>
          </Txt>
        </View>
      )}
    </Pressable>
  );
}

const NAV: { label: string; href: Href; match: string }[] = [
  { label: 'Explorar', href: '/explorar', match: '/explorar' },
  { label: 'Comparar', href: '/comparar', match: '/comparar' },
  { label: 'Demostraciones', href: '/demos', match: '/demos' },
  { label: 'Acerca de', href: '/acerca', match: '/acerca' },
];

function ThemeSwitch() {
  const { theme, toggle } = useVsTheme();
  const dark = theme.name === 'dark';
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: dark }}
      accessibilityLabel="Cambiar tema claro u oscuro"
      style={styles.themeSwitch}>
      <Icon name={dark ? 'weather-night' : 'white-balance-sunny'} size={20} color={dark ? theme.textSecondary : theme.amber} />
      <View style={[styles.track, { backgroundColor: dark ? theme.primary : theme.border }]}>
        <View style={[styles.thumb, { alignSelf: dark ? 'flex-end' : 'flex-start' }]} />
      </View>
    </Pressable>
  );
}

export function TopBar() {
  const { theme } = useVsTheme();
  const { isWide } = useLayout();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: 20 }}>
      <View style={[styles.bar, { borderBottomColor: theme.border }]}>
        <Logo />
        {isWide ? (
          <View style={styles.nav}>
            {NAV.map((n) => {
              const active = path.startsWith(n.match);
              return (
                <Pressable key={n.match} onPress={() => router.navigate(n.href)} accessibilityRole="link" style={styles.navItem}>
                  <Txt variant="small" style={{ fontWeight: active ? '700' : '500' }} color={active ? theme.text : theme.textSecondary}>
                    {n.label}
                  </Txt>
                  <View style={[styles.navUnderline, { backgroundColor: active ? theme.primary : 'transparent' }]} />
                </Pressable>
              );
            })}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <ThemeSwitch />
          {!isWide && (
            <Pressable onPress={() => setOpen((o) => !o)} accessibilityLabel="Abrir menú" hitSlop={10}>
              <Icon name={open ? 'close' : 'menu'} size={26} />
            </Pressable>
          )}
        </View>
      </View>
      {!isWide && open && (
        <View style={[styles.menu, { backgroundColor: theme.name === 'dark' ? '#0B1B3F' : '#fff', borderColor: theme.border }]}>
          {NAV.map((n) => (
            <Pressable
              key={n.match}
              onPress={() => {
                setOpen(false);
                router.navigate(n.href);
              }}
              style={styles.menuItem}>
              <Txt variant="body" style={{ fontWeight: path.startsWith(n.match) ? '700' : '500' }}>
                {n.label}
              </Txt>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

export function Background() {
  const { theme } = useVsTheme();
  const stars = useMemo(() => {
    const r = mulberry32(42);
    return Array.from({ length: 90 }, () => ({ x: r() * 100, y: r() * 100, s: r() * 1.2 + 0.3, o: r() * 0.6 + 0.2 }));
  }, []);
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
            <Stop offset="0" stopColor={theme.bgTop} />
            <Stop offset="1" stopColor={theme.bgBottom} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
        {theme.name === 'dark' &&
          stars.map((s, i) => <Circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="#fff" opacity={s.o} />)}
      </Svg>
    </View>
  );
}

export function ScreenShell({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const { theme } = useVsTheme();
  const { isPhone } = useLayout();
  const content = (
    <View style={[styles.content, { paddingHorizontal: isPhone ? 16 : 28 }]}>
      {children}
      <Txt variant="caption" muted style={{ textAlign: 'center', marginTop: 28, marginBottom: 12 }}>
        Prototipo de simulación · Datos simulados para demostración · NASA International Space Apps Challenge 2026
      </Txt>
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: theme.bgTop }}>
      <Background />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <TopBar />
        {scroll ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </SafeAreaView>
    </View>
  );
}

const STEPS = ['Variable', 'Región y período', 'Resultados'];
const STEP_HREF: Href[] = ['/explorar', '/explorar/region', '/explorar/resultados'];

export function Stepper({ current }: { current: 0 | 1 | 2 }) {
  const { theme } = useVsTheme();
  const { isPhone } = useLayout();
  return (
    <View style={styles.stepper} accessibilityLabel={`Paso ${current + 1} de 3: ${STEPS[current]}`}>
      {STEPS.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={s} style={[styles.stepItem, i < STEPS.length - 1 && { flex: 1 }]}>
            <Pressable
              disabled={i > current}
              onPress={() => router.navigate(STEP_HREF[i])}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: done ? theme.primary : active ? theme.primary + '33' : theme.surfaceStrong,
                    borderColor: done || active ? theme.primary : theme.border,
                  },
                ]}>
                {done ? (
                  <Icon name="check" size={16} color="#fff" />
                ) : (
                  <Txt variant="small" style={{ fontWeight: '800' }} color={active ? theme.primary : theme.textSecondary}>
                    {i + 1}
                  </Txt>
                )}
              </View>
              {(!isPhone || active) && (
                <Txt variant="small" style={{ fontWeight: active ? '700' : '500' }} color={active || done ? theme.text : theme.textSecondary}>
                  {s}
                </Txt>
              )}
            </Pressable>
            {i < STEPS.length - 1 && <View style={[styles.stepLine, { backgroundColor: done ? theme.primary : theme.border }]} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  nav: { flexDirection: 'row', gap: 22, marginLeft: 16 },
  navItem: { paddingVertical: 4, alignItems: 'center' },
  navUnderline: { height: 2, alignSelf: 'stretch', marginTop: 4, borderRadius: 2 },
  themeSwitch: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  track: { width: 40, height: 22, borderRadius: 11, padding: 3 },
  thumb: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff' },
  menu: { position: 'absolute', top: '100%', right: 12, left: 12, borderRadius: 16, borderWidth: 1, paddingVertical: 6 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 18 },
  content: { width: '100%', maxWidth: 1200, alignSelf: 'center', paddingTop: 20, flexGrow: 1 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepCircle: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 8, borderRadius: 1 },
});
