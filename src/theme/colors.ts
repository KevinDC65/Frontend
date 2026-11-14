export type ThemeName = 'dark' | 'light';

export const Palette = {
  blue: '#2DA8FF',
  cyan: '#22D3EE',
  teal: '#14B8A6',
  orange: '#F28C38',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
  violet: '#8B5CF6',
};

const dark = {
  name: 'dark' as ThemeName,
  bgTop: '#050B1F',
  bgBottom: '#0B1B3F',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  surfaceSelected: 'rgba(45,168,255,0.18)',
  border: 'rgba(255,255,255,0.14)',
  text: '#F1F5FF',
  textSecondary: '#A9B7D6',
  textMuted: '#7586A8',
  primary: '#2DA8FF',
  primaryText: '#04122B',
  accent: '#22D3EE',
  chartGrid: 'rgba(255,255,255,0.10)',
  chartAxis: '#A9B7D6',
  ocean: '#0C2A55',
  land: '#2F6B4F',
  landStroke: 'rgba(255,255,255,0.18)',
  overlay: 'rgba(2,6,20,0.7)',
  ...Palette,
};

const light: typeof dark = {
  name: 'light',
  bgTop: '#F4F8FD',
  bgBottom: '#E3EEFB',
  surface: '#FFFFFF',
  surfaceStrong: '#F0F5FC',
  surfaceSelected: '#E2F0FF',
  border: '#D6E3F3',
  text: '#0B1B3F',
  textSecondary: '#44557A',
  textMuted: '#6B7C9C',
  primary: '#1D7FE0',
  primaryText: '#FFFFFF',
  accent: '#0891B2',
  chartGrid: 'rgba(11,27,63,0.08)',
  chartAxis: '#44557A',
  ocean: '#BFDDF7',
  land: '#9BC79B',
  landStroke: 'rgba(11,27,63,0.18)',
  overlay: 'rgba(11,27,63,0.45)',
  ...Palette,
  blue: '#1D7FE0',
  cyan: '#0891B2',
};

export const Themes = { dark, light };
export type Theme = typeof dark;
