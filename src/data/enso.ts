/**
 * Eventos ENSO aproximados (pico y amplitud) para generar índices sintéticos
 * con la forma de la historia real. No son los valores oficiales de NOAA.
 */
export type EnsoEvent = { year: number; month: number; amp: number; width?: number };

export const ONI_EVENTS: EnsoEvent[] = [
  { year: 1982, month: 12, amp: 2.2, width: 7 },
  { year: 1984, month: 12, amp: -0.9 },
  { year: 1987, month: 8, amp: 1.6, width: 8 },
  { year: 1988, month: 12, amp: -1.8 },
  { year: 1991, month: 12, amp: 1.6 },
  { year: 1994, month: 12, amp: 1.1 },
  { year: 1995, month: 11, amp: -1.0 },
  { year: 1997, month: 12, amp: 2.4, width: 7 },
  { year: 1999, month: 12, amp: -1.6, width: 9 },
  { year: 2002, month: 11, amp: 1.3 },
  { year: 2006, month: 11, amp: 0.9 },
  { year: 2007, month: 12, amp: -1.6 },
  { year: 2009, month: 12, amp: 1.6 },
  { year: 2010, month: 12, amp: -1.6 },
  { year: 2011, month: 11, amp: -1.1 },
  { year: 2015, month: 11, amp: 2.6, width: 8 },
  { year: 2017, month: 12, amp: -0.9 },
  { year: 2018, month: 12, amp: 0.9 },
  { year: 2020, month: 11, amp: -1.3 },
  { year: 2021, month: 12, amp: -1.0 },
  { year: 2022, month: 11, amp: -1.0 },
  { year: 2023, month: 12, amp: 2.0, width: 7 },
];

/** Niño 1+2 (costero): más intenso en 1983, 1998, el Niño costero de 2017 y 2023. */
export const N12_EVENTS: EnsoEvent[] = [
  { year: 1983, month: 5, amp: 3.2, width: 6 },
  { year: 1987, month: 4, amp: 1.2 },
  { year: 1988, month: 10, amp: -1.3 },
  { year: 1992, month: 4, amp: 1.0 },
  { year: 1997, month: 12, amp: 3.6, width: 7 },
  { year: 1999, month: 10, amp: -1.2 },
  { year: 2002, month: 3, amp: 0.8 },
  { year: 2007, month: 10, amp: -1.6 },
  { year: 2010, month: 10, amp: -1.3 },
  { year: 2012, month: 4, amp: 1.0 },
  { year: 2015, month: 10, amp: 2.4, width: 7 },
  { year: 2017, month: 3, amp: 2.2, width: 3 },
  { year: 2020, month: 10, amp: -1.1 },
  { year: 2023, month: 6, amp: 2.8, width: 5 },
];
