# VeraScope · Simulación frontend

Prototipo navegable (web y móvil) de **VeraScope – Earth System Trend Detective** (NASA Space Apps 2026),
construido con Expo SDK 58 + Expo Router a partir del *Informe estadístico v1.0* y las 6 interfaces de diseño.

Plan y extracción del informe: [`docs/PLAN_SIMULACION.md`](docs/PLAN_SIMULACION.md).

## Ejecutar

```bash
npm ci                  # instala exactamente lo del package-lock
npx expo start          # w → web · escanea el QR con Expo Go (Android/iOS)
npx expo export -p web  # genera dist/ (SPA) para publicar en cualquier hosting estático
```

## Pantallas

| Ruta | Interfaz |
|---|---|
| `/` | 01 Landing |
| `/explorar` | 02 Catálogo de variables (V1–V13) |
| `/explorar/region` | 03 Región y período (mapa, años, modo dual) |
| `/explorar/resultados` | 04 Resultados (Theil-Sen, Hamed-Rao, IC 95 %, “Quitar El Niño”, veredicto) |
| `/comparar` | 05 Comparación de dos regiones |
| `/demos`, `/demos/efecto-espejo`, `/demos/senal-o-ruido` | 06 Demostraciones guiadas |
| `/acerca` | Fuentes, funciones P1–P11 y limitaciones |

> Los datos son **simulados** con el modelo del informe; los cálculos estadísticos sí se ejecutan (`src/lib`).

## Cómo trabajar en equipo

Este repositorio es **solo del frontend** y es independiente del repositorio compartido con backend
(`miacordov/VeraScope`). Nada de aquí se sube allá automáticamente.

```bash
git switch main && git pull --rebase origin main
git switch -c feat/<lo-que-haces>      # o fix/…, docs/…, chore/…
# … commits pequeños en español: feat: / fix: / docs: / chore: / test:
git pull --rebase origin main          # antes de abrir el PR
git push -u origin feat/<lo-que-haces> # y abre el PR hacia main
```

- `main` siempre funciona: todo entra por PR, con la aprobación de otra persona y el CI en verde.
- Nada de `git push --force` a `main`.
- Antes de abrir el PR: `npm run typecheck`, `npm run lint` y `npm run export:web` sin errores, y capturas en
  teléfono y web si cambia una pantalla.
- Paquetes nuevos solo con `npx expo install <paquete>`, avisando al equipo.
