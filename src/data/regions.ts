export type Region = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Semiancho del recuadro en grados (solo para dibujar). */
  size: number;
};

export const PRESET_REGIONS: Region[] = [
  { id: 'piura', name: 'Costa norte del Perú (Piura)', lat: -5.2, lon: -80.6, size: 4 },
  { id: 'indonesia', name: 'Indonesia / N. Australia', lat: -8, lon: 125, size: 10 },
  { id: 'amazonia', name: 'Amazonía central', lat: -4, lon: -62, size: 6 },
  { id: 'sahel', name: 'Sahel', lat: 14, lon: 5, size: 8 },
  { id: 'california', name: 'California', lat: 37, lon: -120, size: 4 },
  { id: 'india', name: 'India central', lat: 21, lon: 79, size: 6 },
];

export const DEFAULT_A = PRESET_REGIONS[0];
export const DEFAULT_B = PRESET_REGIONS[1];

export function customRegion(lat: number, lon: number): Region {
  const near = PRESET_REGIONS.find((r) => Math.abs(r.lat - lat) <= r.size && Math.abs(r.lon - lon) <= r.size);
  if (near) return near;
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'O';
  return {
    id: `cell_${lat.toFixed(1)}_${lon.toFixed(1)}`,
    name: `Celda ${Math.abs(lat).toFixed(1)}°${ns}, ${Math.abs(lon).toFixed(1)}°${ew}`,
    lat: Math.round(lat * 2) / 2,
    lon: Math.round(lon * 2) / 2,
    size: 3,
  };
}
