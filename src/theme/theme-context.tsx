import { createContext, useContext, useState, type ReactNode } from 'react';

import { Themes, type Theme, type ThemeName } from './colors';

type ThemeCtx = { theme: Theme; toggle: () => void; setName: (n: ThemeName) => void };

const Ctx = createContext<ThemeCtx | null>(null);

export function VsThemeProvider({ children }: { children: ReactNode }) {
  // El diseño de referencia usa el tema oscuro por defecto.
  const [name, setName] = useState<ThemeName>('dark');
  const value: ThemeCtx = {
    theme: Themes[name],
    toggle: () => setName((n) => (n === 'dark' ? 'light' : 'dark')),
    setName,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVsTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVsTheme debe usarse dentro de VsThemeProvider');
  return ctx;
}
