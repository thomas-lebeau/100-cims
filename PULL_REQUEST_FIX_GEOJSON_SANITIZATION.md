# PR: Fix GeoJSON sanitization (prevent "coordinates must contain numbers")

Resumen
-------

Este PR aplica validaciones defensivas en `src/lib/geojson.ts` para evitar
que coordenadas corruptas (null, undefined, NaN o strings) provoquen una
excepción en runtime: "coordinates must contain numbers".

Problema
--------

Al importar actividades de Strava, algunas tracks contienen puntos con
coordenadas inválidas. Estas entradas llegaban sin filtrar a las funciones
que construyen GeoJSON / llaman a `@turf/point-to-line-distance`, lo que
provocaba el siguiente error en cliente:

  Uncaught Error: coordinates must contain numbers

Stacktrace indicaba llamadas desde `geojson.ts` (líneas ~116-140) y
`strava-importer.tsx`.

Qué cambié
-----------

- En `src/lib/geojson.ts`:
  - Se valida que `polyline` sea una cadena y se envuelve `decodePolyline`
    en `try/catch` para que fallos en decodificación devuelvan `[]` en vez de
    romper la ejecución.
  - Se añadieron `isValidNumber`, `isValidCoordPair` y
    `sanitizeCoordinates` para filtrar cualquier punto cuya latitud/longitud
    no sean números finitos (`Number.isFinite`).
  - Si después del filtrado quedan < 2 puntos, la función devuelve `[]`.
  - Se validan las coordenadas de cada `cim` antes de calcular la distancia y
    la llamada a `pointToLineDistance` está en `try/catch` para evitar fallos
    puntuales.

Por qué esto arregla el error
----------------------------

El stack trace señalaba que se estaban pasando valores no numéricos a las
rutinas GeoJSON/Turf. Al filtrar puntos inválidos y evitar que `decodePolyline`
lance, la UI ya no debería recibir entradas corruptas que provocaran
excepciones.

Limitaciones / Notas
--------------------

- Cambios no incluyen tests automáticos; no hay pruebas unitarias añadidas en
  este commit.
- No se ha desplegado ni verificado en producción; se necesita una prueba
  manual local o en un entorno de staging.

Pasos recomendados para probar localmente
----------------------------------------

1. Instalar dependencias:

```powershell
npm ci
```

1. Arrancar el servidor de desarrollo (PowerShell):

```powershell
npx next dev --turbopack
```

1. Abrir <http://localhost:3000/settings/strava> y comprobar DevTools → Console.
   - Antes: verías "Uncaught Error: coordinates must contain numbers".
   - Ahora: la UI no debe romper; la lista de actividades/importe debe mostrarse.

2. Opcional: crear un endpoint de test o llamar `getCimForPolyline` con
   polylines corruptos para verificar que la función devuelve `[]` en esos
   casos.

Comandos para crear la rama y abrir el PR (local)
------------------------------------------------

```powershell
git checkout -b fix/geojson-sanitization
git add src/lib/geojson.ts
git add PULL_REQUEST_FIX_GEOJSON_SANITIZATION.md
git commit -m "Defensive: sanitize polyline coordinates to avoid GeoJSON errors"
git push --set-upstream origin fix/geojson-sanitization
# Luego abre un PR en GitHub con el branch creado
```

Si quieres, puedo añadir:

- tests unitarios para `getCimForPolyline` (recomendado),
- un endpoint de prueba para validar varios polylines, o
- logging/Datadog metrics para contar puntos filtrados.

Estado: cambios aplicados en el workspace, listo para crear y enviar PR.
