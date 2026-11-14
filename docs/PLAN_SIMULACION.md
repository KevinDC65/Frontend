# VeraScope · Plan de simulación frontend

Fuente: *VeraScope – Informe estadístico v1.0* (13/11/2026) y las 6 interfaces de
`Descargas/verascope_pantallas_individuales/`. Objetivo: una simulación navegable en
**web y móvil** (Expo SDK 58 + Expo Router) que muestre el diseño y una interacción básica.

---

## 1. Qué del informe corresponde al frontend

El informe es mayormente estadístico (motor en Python). Solo se extrae lo que **el usuario ve
o manipula**:

| Elemento del informe | Lo que implica para la interfaz |
|---|---|
| **Propuestas P1–P11** (sección 1) | Son las funciones de producto. P1, P2, P5, P7, P8 se simulan; P4 aparece como “efecto espejo” en Comparar; P3, P6, P9–P11 se listan en *Acerca de* como “próximamente / propuesto”. |
| **P1 · Veredicto de 4 estados** (C13) | Tarjeta de resultado: *Cambio robusto*, *Sensible a El Niño*, *Cambio oculto*, *Sin tendencia detectable*, con dirección (sube/baja) e interpretación. |
| **P2 · Interruptor “Quitar El Niño”** (C9–C10) | Switch en Resultados que alterna serie original ↔ serie sin El Niño y recalcula. |
| **Índice ONI / Niño 1+2** (V6, V7) | Selector del índice; “el índice usado se informa siempre en la tarjeta de veredicto”. |
| **Tasa de cambio** (C4, C7) | Pendiente Theil-Sen **por década** con unidad, **IC 95 %** coherente, cambio total y % por década (solo variables con cero natural; nunca en temperatura). |
| **Significancia** (C5–C6) | p-valor Mann-Kendall con corrección **Hamed-Rao**. |
| **Diagnósticos** (C2, C12) | Avisos: ventana < 120 meses no se analiza; < 240 meses “potencia baja”; colinealidad índice-tiempo > 0.3. |
| **Fases de El Niño** (V6, C17) | Bandas sombreadas en el gráfico (Niño ≥ 0.5 naranja, Niña ≤ −0.5 azul) y aviso de periodos detectados. |
| **Comparador en el tiempo** (P5, C16) | Δ entre periodos 1981–2001 y 2003+, original vs sin El Niño. |
| **Meses inusuales** (C17) | |z| > 2, contados por fase. |
| **Teleconexión / líneas** (P4, C15) | En Comparar: correlación A–B con tamaño efectivo (C11): “se mueven en espejo”. |
| **Fichas de variables V1–V13** (sección 4) | Catálogo: nombre, fuente, unidad, qué mide, capa (en vivo / covariable / precalculada / contexto) y estado (DECIDIDO / PROPUESTO). V6–V7 son covariables y V13 solo contexto: no se analizan. |
| **Alineación temporal** (sección 3) | Rango de años: POWER desde 1981; IMERG desde 1998; GLDAS/MODIS desde 2000; fin = último año completo. Mínimo 10 años. |
| **Escala mensual** (sección 2) | Resolución *Mensual* recomendada; *Anual* disponible; *Diaria* deshabilitada con explicación. |
| **Demos P7 y P8** | Demostración guiada “El efecto espejo de El Niño” (Piura vs Indonesia/N. Australia) y “¿Señal real o ruido climático?” (temperatura 10 años vs registro completo). |
| **Limitaciones** (sección 14) | Página *Acerca de*. |

Lo que **no** se lleva al frontend: librerías Python, fórmulas de implementación, matriz cálculo × librería,
validación por simulación (solo se resumen en *Acerca de*).

## 2. Pantallas (según las 6 interfaces)

| # | Interfaz | Ruta | Interacción simulada |
|---|---|---|---|
| 01 | Landing | `/` | CTA “Comenzar investigación”, tarjetas a las dos demos, tema claro/oscuro. |
| 02 | Catálogo de variables | `/explorar` | Búsqueda, filtros por esfera, selección de tarjeta, panel de detalle, “Usar esta variable”. |
| 03 | Región y período | `/explorar/region` | Stepper 1-2-3, mapa: tocar para ubicar A (y B en modo dual), regiones predefinidas, resolución, rango de años con validación, “Analizar tendencia”. |
| 04 | Resultados estadísticos | `/explorar/resultados` | Gráfico de anomalías + Theil-Sen + IC 95 % + bandas El Niño, veredicto, “Quitar El Niño”, selector de índice, chips de método, diagnósticos, Δ entre periodos. |
| 05 | Comparación de regiones | `/comparar` | Variable/resolución/periodo, dos gráficos con escala sincronizada, veredictos, mini-mapa, efecto espejo. |
| 06 | Demostración guiada | `/demos/[id]` | 5 pasos con barra de progreso, Anterior/Siguiente, enlace a la otra demo. |
| — | Demostraciones / Acerca de | `/demos`, `/acerca` | Listado y fuentes, propuestas, limitaciones. |

## 3. Datos simulados (transparentes)

No hay backend. Las series se **generan** con el mismo modelo del marco teórico del informe:

`x_t = μ_m(t) + β·t + γ·E_(t−ℓ) + ε_t`, con `ε_t` AR(1).

- El índice ONI/Niño 1+2 sintético reproduce los eventos históricos conocidos (1982–83, 1997–98,
  2015–16, 2023–24, Niño costero 2017).
- Cada región/variable tiene su respuesta esperada según las fichas (Piura: lluvia ↑ con El Niño y
  asimétrica; Indonesia/N. Australia: ↓; temperatura con tendencia de fondo).
- Un punto cualquiera del mapa usa un perfil derivado de su latitud/longitud (semilla determinista).
- La interfaz indica siempre “Datos simulados para demostración”.

Sobre esas series los cálculos **sí se ejecutan** en TypeScript (versión simplificada del motor):
anomalías (C3), Theil-Sen (C4), Mann-Kendall + Hamed-Rao (C5–C6), IC coherente (C7), rezago (C9),
regresión conjunta y serie sin El Niño (C10), correlación con n efectivo (C11), diagnósticos (C12),
veredicto (C13), Δ periodos (C16), meses inusuales (C17).

## 4. Arquitectura en `verascope-frontend`

```
src/
  app/                    rutas Expo Router (Stack sin cabecera nativa)
    _layout.tsx           proveedores de tema y estado
    index.tsx             01 Landing
    explorar/index.tsx    02 Catálogo
    explorar/region.tsx   03 Región y período
    explorar/resultados.tsx 04 Resultados
    comparar.tsx          05 Comparación
    demos/index.tsx, demos/[id].tsx  06 Demos
    acerca.tsx
  components/vs/          UI: TopBar, Logo, Stepper, Card, Chip, Segmented, Button,
                          TimeSeriesChart, IndexChart, WorldMap, Globe, VerdictCard…
  data/                   variables V1–V13, regiones, eventos ENSO, polígonos del mapa
  lib/                    random, simulate, stats, analysis
  state/simulation.tsx    estado del flujo (variable, región, período, índice…)
  theme/                  paleta oscura/clara del diseño + contexto con interruptor
```

- Gráficos, globo y mapa en **react-native-svg** (funciona igual en web, Android e iOS y en Expo Go).
- Íconos con **@expo/vector-icons**.
- Diseño adaptable: ≥ 900 px dos columnas (como las maquetas); en móvil se apilan y el menú se
  vuelve desplegable.
- Web exportable como SPA (`web.output: "single"`).

## 5. Fases

1. Sistema visual (paleta, tipografía, tarjetas vidrio, logo, fondo estrellado, tema claro/oscuro).
2. Datos y motor simplificado (`lib/`).
3. Pantallas 01 → 06 en el orden del flujo, más *Acerca de*.
4. Pruebas: `npx tsc --noEmit`, `npx expo lint`, `npx expo export -p web`, revisión en Expo Go.

## 6. Cómo ejecutar

```bash
npm install
npx expo start          # w = web · escanear QR con Expo Go para Android/iOS
npx expo export -p web  # genera dist/ para publicar la versión web
```
