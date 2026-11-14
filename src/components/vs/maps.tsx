import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, View, type GestureResponderEvent, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, Path, RadialGradient, Rect, Stop, Text as SvgText } from 'react-native-svg';

import type { Region } from '@/data/regions';
import { CONTINENTS, MAP_LAT_BOTTOM, MAP_LAT_TOP } from '@/data/world';
import { useVsTheme } from '@/theme/theme-context';

type Marker = { region: Region; label: string; color: string; shape: 'circle' | 'square' };

function wrapLon(lon: number) {
  return ((((lon + 180) % 360) + 360) % 360) - 180;
}

/** Mapa equirectangular simplificado. Tocar el mapa devuelve lat/lon. */
export function WorldMap({
  markers = [],
  onPick,
  centerLon = 0,
  aspect = 0.5,
  heat,
  rounded = 16,
}: {
  markers?: Marker[];
  onPick?: (lat: number, lon: number) => void;
  centerLon?: number;
  aspect?: number;
  /** Mancha de anomalía cálida del Pacífico (demo de El Niño), intensidad 0–1. */
  heat?: number;
  rounded?: number;
}) {
  const { theme } = useVsTheme();
  const [w, setW] = useState(600);
  const h = w * aspect;
  const onLayout = (e: LayoutChangeEvent) => setW(Math.max(220, e.nativeEvent.layout.width));
  const X = (lon: number) => ((wrapLon(lon - centerLon) + 180) / 360) * w;
  const Y = (lat: number) => ((MAP_LAT_TOP - lat) / (MAP_LAT_TOP - MAP_LAT_BOTTOM)) * h;

  const paths = useMemo(
    () =>
      CONTINENTS.map((poly) => {
        // Se desenrolla el polígono para que no cruce el borde; luego se dibuja en 3 copias.
        let prev: number | null = null;
        return (
          poly
            .map(([lon, lat], i) => {
              let x = ((lon - centerLon + 180) / 360) * w;
              if (prev !== null) {
                while (x - prev > w / 2) x -= w;
                while (prev - x > w / 2) x += w;
              } else {
                while (x < 0) x += w;
                while (x > w) x -= w;
              }
              prev = x;
              const y = ((MAP_LAT_TOP - lat) / (MAP_LAT_TOP - MAP_LAT_BOTTOM)) * h;
              return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
            })
            .join(' ') + ' Z'
        );
      }),
    [w, h, centerLon],
  );

  const handlePress = (e: GestureResponderEvent) => {
    if (!onPick) return;
    const ne = e.nativeEvent as unknown as { locationX?: number; locationY?: number; offsetX?: number; offsetY?: number };
    const x = ne.locationX ?? ne.offsetX ?? 0;
    const y = ne.locationY ?? ne.offsetY ?? 0;
    const lon = wrapLon((x / w) * 360 - 180 + centerLon);
    const lat = MAP_LAT_TOP - (y / h) * (MAP_LAT_TOP - MAP_LAT_BOTTOM);
    onPick(Math.max(-58, Math.min(78, lat)), lon);
  };

  const heatCx = X(-120);
  return (
    <View onLayout={onLayout} style={{ width: '100%', borderRadius: rounded, overflow: 'hidden' }}>
      <Pressable onPress={handlePress} disabled={!onPick} accessibilityLabel="Mapa mundial: toca para elegir una región">
        <Svg width={w} height={h} pointerEvents="none">
          <Defs>
            <RadialGradient id="heat" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FF3B1F" stopOpacity={0.95} />
              <Stop offset="0.45" stopColor="#F28C38" stopOpacity={0.7} />
              <Stop offset="1" stopColor="#F28C38" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="cold" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#2DA8FF" stopOpacity={0.7} />
              <Stop offset="1" stopColor="#2DA8FF" stopOpacity={0} />
            </RadialGradient>
            <ClipPath id="clip">
              <Rect x={0} y={0} width={w} height={h} />
            </ClipPath>
          </Defs>
          <Rect x={0} y={0} width={w} height={h} fill={theme.ocean} />
          {heat !== undefined && heat > 0 && (
            <G opacity={heat}>
              <Ellipse cx={heatCx} cy={Y(0)} rx={w * 0.2} ry={h * 0.09} fill="url(#heat)" />
              <Ellipse cx={X(140)} cy={Y(10)} rx={w * 0.07} ry={h * 0.12} fill="url(#cold)" />
            </G>
          )}
          {[-40, -20, 0, 20, 40, 60].map((lat) => (
            <Line key={lat} x1={0} x2={w} y1={Y(lat)} y2={Y(lat)} stroke={theme.landStroke} strokeWidth={lat === 0 ? 1 : 0.5} strokeDasharray={lat === 0 ? undefined : '2,4'} />
          ))}
          <G clipPath="url(#clip)">
            {[-w, 0, w].map((dx) => (
              <G key={dx} x={dx}>
                {paths.map((d, i) => (
                  <Path key={i} d={d} fill={theme.land} stroke={theme.landStroke} strokeWidth={0.8} />
                ))}
              </G>
            ))}
          </G>
          {markers.map((m) => {
            const cx = X(m.region.lon), cy = Y(m.region.lat);
            const s = Math.max(14, (m.region.size / 360) * w * 1.4);
            return (
              <G key={m.label}>
                {m.shape === 'square' ? (
                  <Rect x={cx - s} y={cy - s} width={s * 2} height={s * 2} rx={4} fill={m.color} fillOpacity={0.35} stroke={m.color} strokeWidth={2} />
                ) : (
                  <Circle cx={cx} cy={cy} r={s} fill={m.color} fillOpacity={0.35} stroke={m.color} strokeWidth={2} />
                )}
                <Circle cx={cx} cy={cy} r={11} fill={m.color} />
                <SvgText x={cx} y={cy + 4} fontSize={12} fontWeight="bold" fill="#fff" textAnchor="middle">
                  {m.label}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </Pressable>
    </View>
  );
}

/** Globo terráqueo en proyección ortográfica, con rotación lenta. */
export function Globe({ size = 360 }: { size?: number }) {
  const { theme } = useVsTheme();
  const [lon0, setLon0] = useState(-70);
  useEffect(() => {
    let alive = true;
    let id: ReturnType<typeof setInterval> | undefined;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!alive || reduce) return;
      id = setInterval(() => setLon0((l) => (l + 0.6) % 360), 60);
    });
    return () => {
      alive = false;
      if (id) clearInterval(id);
    };
  }, []);
  const R = size / 2 - 14;
  const c = size / 2;
  const lat0 = (12 * Math.PI) / 180;
  const proj = (lon: number, lat: number) => {
    const l = ((lon - lon0) * Math.PI) / 180;
    const p = (lat * Math.PI) / 180;
    const x = Math.cos(p) * Math.sin(l);
    const y = Math.cos(lat0) * Math.sin(p) - Math.sin(lat0) * Math.cos(p) * Math.cos(l);
    const z = Math.sin(lat0) * Math.sin(p) + Math.cos(lat0) * Math.cos(p) * Math.cos(l);
    if (z < 0) {
      const n = Math.hypot(x, y) || 1;
      return { x: c + (x / n) * R, y: c - (y / n) * R, vis: false };
    }
    return { x: c + x * R, y: c - y * R, vis: true };
  };
  const paths = CONTINENTS.map((poly) => {
    const pts = poly.map(([lo, la]) => proj(lo, la));
    if (!pts.some((p) => p.vis)) return null;
    return pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ' Z';
  });
  const grat: string[] = [];
  for (let lo = -180; lo < 180; lo += 30) {
    const pts = [];
    for (let la = -80; la <= 80; la += 10) pts.push(proj(lo, la));
    if (pts.some((p) => p.vis)) grat.push(pts.filter((p) => p.vis).map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '));
  }
  return (
    <Svg width={size} height={size} accessibilityLabel="Ilustración del planeta Tierra">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0.82" stopColor="#38BDF8" stopOpacity={0.55} />
          <Stop offset="1" stopColor="#38BDF8" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id="ocean" cx="35%" cy="30%" r="80%">
          <Stop offset="0" stopColor="#3B82F6" />
          <Stop offset="0.55" stopColor="#0B3D91" />
          <Stop offset="1" stopColor="#020A24" />
        </RadialGradient>
        <RadialGradient id="shade" cx="30%" cy="28%" r="85%">
          <Stop offset="0.5" stopColor="#000" stopOpacity={0} />
          <Stop offset="1" stopColor="#000" stopOpacity={0.65} />
        </RadialGradient>
        <ClipPath id="gclip">
          <Circle cx={c} cy={c} r={R} />
        </ClipPath>
      </Defs>
      <Circle cx={c} cy={c} r={R + 14} fill="url(#glow)" />
      <Circle cx={c} cy={c} r={R} fill="url(#ocean)" />
      <G clipPath="url(#gclip)">
        {grat.map((d, i) => (
          <Path key={i} d={d} stroke="#9CC9FF" strokeOpacity={0.12} fill="none" />
        ))}
        {paths.map((d, i) => (d ? <Path key={i} d={d} fill="#3C8D5A" stroke="#C8E6C9" strokeOpacity={0.3} strokeWidth={0.6} /> : null))}
        <Ellipse cx={c - R * 0.2} cy={c - R * 0.55} rx={R * 0.5} ry={R * 0.08} fill="#fff" opacity={0.18} />
        <Ellipse cx={c + R * 0.3} cy={c + R * 0.25} rx={R * 0.4} ry={R * 0.06} fill="#fff" opacity={0.14} />
        <Circle cx={c} cy={c} r={R} fill="url(#shade)" />
      </G>
      <Circle cx={c} cy={c} r={R} stroke={theme.cyan} strokeOpacity={0.35} strokeWidth={1} fill="none" />
    </Svg>
  );
}
