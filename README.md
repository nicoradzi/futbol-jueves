# ⚽ Fútbol del Jueves

Web mobile-first para administrar el fútbol 6 semanal del grupo.

## Incluye

- Base de jugadores ampliable.
- Habilidad y stamina 1–5.
- Hasta dos posiciones.
- Convocatoria semanal con máximo de 12.
- Generador de dos equipos equilibrados.
- Rebarajado e intercambio manual.
- Registro de resultado e historial.
- Tabla y estadísticas.
- MVP de los últimos 30 días.
- El Paredón.
- Copiar equipos para WhatsApp.
- Backup/importación JSON.
- Lectura pública y administración mediante Supabase Auth.
- Manifest PWA.

## Arquitectura

Frontend estático: HTML + CSS + JavaScript.
Backend, base de datos y autenticación: Supabase.

El frontend está preparado para hosting estático (por ejemplo GitHub Pages).

## Configuración

1. Crear el proyecto en Supabase.
2. Ejecutar `supabase_schema.sql` en SQL Editor.
3. Crear las cuentas administradoras en Authentication > Users.
4. Configurar `config.js` con Project URL y Publishable key.
5. Publicar este repositorio mediante GitHub Pages o cualquier hosting estático.

La Publishable key puede estar en el navegador; no es la `service_role` key. Nunca publicar secretos de Supabase.

## Flujo

Base de jugadores → convocatoria martes/miércoles → 12 confirmados → equipos → partido jueves → resultado → estadísticas.

## Algoritmo de equipos

El generador usa múltiples combinaciones y swaps locales para minimizar una función de costo que contempla habilidad, stamina, rendimiento histórico y cobertura de posiciones. `Rebarajar` produce otra alternativa cercana.
