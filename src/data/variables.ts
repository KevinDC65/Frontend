/** Fichas de variables V1–V13 del Informe estadístico (sección 4), reducidas a lo que muestra la interfaz. */

export type Sphere = 'atmosfera' | 'hidrosfera' | 'biosfera' | 'oceano';
export type Layer = 'en-vivo' | 'covariable' | 'precalculada' | 'contexto';
export type Status = 'DECIDIDO' | 'PROPUESTO';
export type VariableKind = 'rain' | 'temp' | 'soil' | 'humidity' | 'et' | 'runoff' | 'ndvi' | 'index' | 'co2';

export type Variable = {
  id: string;
  code: string;
  name: string;
  short: string;
  description: string;
  source: string;
  unit: string;
  sphere: Sphere;
  layer: Layer;
  status: Status;
  kind: VariableKind;
  /** Primer año con datos (alineación temporal, sección 3). */
  startYear: number;
  /** Respuesta esperada a El Niño (texto de la ficha). */
  ensoResponse: string;
  /** Se puede analizar como tendencia (V6, V7 son covariables y V13 solo contexto). */
  analyzable: boolean;
  /** Tiene cero natural: se informa el % por década (C4). */
  percentOk: boolean;
  proposals: string;
  icon: string;
};

export const VARIABLES: Variable[] = [
  {
    id: 'V1', code: 'PRECTOTCORR', name: 'Precipitación', short: 'Lluvia',
    description: 'Cantidad de agua que cae en forma de lluvia o nieve.',
    source: 'NASA POWER · MERRA-2', unit: 'mm/día', sphere: 'atmosfera', layer: 'en-vivo',
    status: 'DECIDIDO', kind: 'rain', startYear: 1981, analyzable: true, percentOk: true,
    ensoResponse: 'Costa norte del Perú: aumento fuerte en eventos intensos. Indonesia y norte de Australia: disminución.',
    proposals: 'P1, P2, P3, P4, P5, P6, P7, P9, P10, P11', icon: 'weather-pouring',
  },
  {
    id: 'V2', code: 'T2M', name: 'Temperatura del aire', short: 'Temperatura',
    description: 'Temperatura promedio del aire a 2 m sobre la superficie.',
    source: 'NASA POWER · MERRA-2', unit: '°C', sphere: 'atmosfera', layer: 'en-vivo',
    status: 'DECIDIDO', kind: 'temp', startYear: 1981, analyzable: true, percentOk: false,
    ensoResponse: 'Calentamiento en la costa peruana durante los eventos. Es donde la tendencia de fondo sobrevive con más claridad al quitar El Niño.',
    proposals: 'P1, P2, P3, P5, P6, P8, P10, P11', icon: 'thermometer',
  },
  {
    id: 'V5', code: 'RH2M', name: 'Humedad relativa', short: 'Humedad rel.',
    description: 'Vapor de agua del aire en relación con el máximo posible a esa temperatura.',
    source: 'NASA POWER · MERRA-2', unit: '%', sphere: 'atmosfera', layer: 'en-vivo',
    status: 'DECIDIDO', kind: 'humidity', startYear: 1981, analyzable: true, percentOk: true,
    ensoResponse: 'Aumenta en la costa norte del Perú con la lluvia; depende también de la temperatura.',
    proposals: 'P1, P2, P3, P4, P6', icon: 'water-percent',
  },
  {
    id: 'V3', code: 'GWETROOT', name: 'Humedad del suelo (raíces)', short: 'Suelo raíces',
    description: 'Agua disponible para las raíces, capa de 0 a 100 cm.',
    source: 'NASA POWER · MERRA-2', unit: '0–1', sphere: 'hidrosfera', layer: 'en-vivo',
    status: 'DECIDIDO', kind: 'soil', startYear: 1981, analyzable: true, percentOk: true,
    ensoResponse: 'Sigue a la lluvia con meses de rezago: desciende en Indonesia y el norte de Australia.',
    proposals: 'P1, P2, P3, P4, P5, P6, P10', icon: 'sprout',
  },
  {
    id: 'V4', code: 'GWETTOP', name: 'Humedad del suelo superficial', short: 'Suelo superf.',
    description: 'Humedad de los primeros centímetros: responde rápido a lluvia y evaporación.',
    source: 'NASA POWER · MERRA-2', unit: '0–1', sphere: 'hidrosfera', layer: 'en-vivo',
    status: 'DECIDIDO', kind: 'soil', startYear: 1981, analyzable: true, percentOk: true,
    ensoResponse: 'Igual que la humedad en raíces, con menor rezago.',
    proposals: 'P1, P2, P3, P4, P5, P6, P9, P10', icon: 'water-outline',
  },
  {
    id: 'V8', code: 'GPM_3IMERGM', name: 'Lluvia satelital', short: 'IMERG',
    description: 'Estimación satelital independiente del modelo MERRA-2.',
    source: 'GPM IMERG V07', unit: 'mm/día', sphere: 'atmosfera', layer: 'precalculada',
    status: 'PROPUESTO', kind: 'rain', startYear: 1998, analyzable: true, percentOk: true,
    ensoResponse: 'Si coincide con MERRA-2, la conclusión es más sólida (contraste entre fuentes).',
    proposals: 'P9', icon: 'satellite-variant',
  },
  {
    id: 'V9', code: 'Evap_tavg', name: 'Evapotranspiración', short: 'Evapotransp.',
    description: 'Agua que vuelve a la atmósfera desde el suelo y las plantas.',
    source: 'GLDAS Noah 2.1', unit: 'mm/día', sphere: 'hidrosfera', layer: 'precalculada',
    status: 'PROPUESTO', kind: 'et', startYear: 2000, analyzable: true, percentOk: true,
    ensoResponse: 'Junto con la lluvia, muestra si la sequía reduce el agua que vuelve a la atmósfera.',
    proposals: 'P9, demo 1', icon: 'weather-windy',
  },
  {
    id: 'V10', code: 'Qs_acc + Qsb_acc', name: 'Escorrentía', short: 'Escorrentía',
    description: 'Agua que escurre de la celda: lo más cercano al caudal de los ríos.',
    source: 'GLDAS Noah 2.1', unit: 'mm/día', sphere: 'hidrosfera', layer: 'precalculada',
    status: 'PROPUESTO', kind: 'runoff', startYear: 2000, analyzable: true, percentOk: true,
    ensoResponse: 'No reemplaza a una estación de aforo.',
    proposals: 'P9, demo 1', icon: 'waves',
  },
  {
    id: 'V11', code: 'SoilMoi0_10cm', name: 'Humedad del suelo 0–10 cm', short: 'Suelo GLDAS',
    description: 'Contraste de la humedad superficial con otro modelo de superficie.',
    source: 'GLDAS Noah 2.1', unit: 'kg/m²', sphere: 'hidrosfera', layer: 'precalculada',
    status: 'PROPUESTO', kind: 'soil', startYear: 2000, analyzable: true, percentOk: true,
    ensoResponse: 'Se comparan anomalías estandarizadas y signos de tendencia, no magnitudes.',
    proposals: 'P9', icon: 'layers-outline',
  },
  {
    id: 'V12', code: 'MOD13C2', name: 'Índice de vegetación', short: 'NDVI',
    description: 'Verdor de la vegetación: la consecuencia biológica de la sequía o la lluvia.',
    source: 'MODIS Terra 6.1', unit: 'adimensional', sphere: 'biosfera', layer: 'precalculada',
    status: 'PROPUESTO', kind: 'ndvi', startYear: 2000, analyzable: true, percentOk: true,
    ensoResponse: 'El desierto costero de Piura reverdece tras las lluvias de El Niño.',
    proposals: 'P9, demo 1', icon: 'leaf',
  },
  {
    id: 'V6', code: 'ONI', name: 'Índice Oceánico de El Niño', short: 'ONI',
    description: 'Anomalía de temperatura del mar en Niño 3.4 (media móvil de 3 meses).',
    source: 'NOAA CPC', unit: '°C', sphere: 'oceano', layer: 'covariable',
    status: 'DECIDIDO', kind: 'index', startYear: 1981, analyzable: false, percentOk: false,
    ensoResponse: 'Covariable: El Niño si ONI ≥ 0.5, La Niña si ≤ −0.5.',
    proposals: 'P1–P8, P10–P11', icon: 'chart-bell-curve',
  },
  {
    id: 'V7', code: 'Niño 1+2', name: 'Índice Niño 1+2', short: 'Niño 1+2',
    description: 'Anomalía del mar frente a Ecuador y el norte del Perú: capta los Niños costeros.',
    source: 'NOAA CPC', unit: '°C', sphere: 'oceano', layer: 'covariable',
    status: 'DECIDIDO', kind: 'index', startYear: 1981, analyzable: false, percentOk: false,
    ensoResponse: 'Alternativa al ONI para la costa norte del Perú (p. ej., el Niño costero de 2017).',
    proposals: 'P1, P2, P6, P7', icon: 'chart-line-variant',
  },
  {
    id: 'V13', code: 'CO₂', name: 'CO₂ atmosférico', short: 'CO₂',
    description: 'Concentración mensual en Mauna Loa. Solo franja de contexto.',
    source: 'NOAA GML', unit: 'ppm', sphere: 'atmosfera', layer: 'contexto',
    status: 'PROPUESTO', kind: 'co2', startYear: 1981, analyzable: false, percentOk: false,
    ensoResponse: 'No se correlaciona con ninguna variable: dos series con tendencia siempre parecen correlacionadas.',
    proposals: 'P6, como contexto', icon: 'molecule-co2',
  },
];

export const SPHERES: { id: Sphere | 'todas'; label: string; icon: string }[] = [
  { id: 'todas', label: 'Todas', icon: 'earth' },
  { id: 'atmosfera', label: 'Atmósfera', icon: 'weather-cloudy' },
  { id: 'hidrosfera', label: 'Hidrósfera', icon: 'water' },
  { id: 'biosfera', label: 'Biósfera', icon: 'leaf' },
  { id: 'oceano', label: 'Océano', icon: 'waves' },
];

export const LAYER_LABEL: Record<Layer, string> = {
  'en-vivo': 'Capa en vivo',
  covariable: 'Covariable',
  precalculada: 'Capa precalculada',
  contexto: 'Solo contexto',
};

export function getVariable(id: string) {
  return VARIABLES.find((v) => v.id === id) ?? VARIABLES[0];
}

/** Último año completo de MERRA-2 en la simulación. */
export const END_YEAR = 2024;
export const FIRST_YEAR = 1981;
