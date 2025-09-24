# Guía de Implementación y Próximos Pasos

¡Felicidades! Casi todo está listo. Sigue esta guía para finalizar la configuración y poner en marcha tu aplicación, incluyendo la nueva automatización.

### Paso 1: Configurar la Base de Datos (¡Acción Requerida!)

Esta es la única acción manual que debes realizar en Supabase para que la automatización funcione.

1.  **Ir a Supabase**: Abre tu proyecto de Supabase y ve a `Database` > `Tables`.
2.  **Seleccionar la tabla `products`**.
3.  **Añadir 2 nuevas columnas**:
    *   **Columna 1 (SKU):**
        *   **Name**: `sku`
        *   **Type**: `text`
        *   Deja el resto de opciones por defecto y haz clic en `Save`.
    *   **Columna 2 (Fecha de Republicación):**
        *   **Name**: `scheduled_republish_at`
        *   **Type**: `timestamptz` (es importante que sea `timestamp with time zone`).
        *   Marca la casilla **`Is Nullable`** para permitir valores nulos.
        *   Deja el resto por defecto y haz clic en `Save`.

¡Listo! Tu base de datos ya está preparada.

### Paso 2: Probar la Aplicación Principal

Antes de pasar a la automatización, asegúrate de que todo lo demás funciona.

1.  **Inicia la aplicación** localmente con `npm run dev`.
2.  **Inicia sesión** o crea una cuenta nueva.
3.  **Añade/Edita un producto**: Asegúrate de que puedes rellenar el nuevo campo `SKU`.
4.  **Genera un Reporte de IA**: Ve a la sección "Reportes", elige una plantilla y genera un reporte para confirmar que tu `GEMINI_API_KEY` funciona.
5.  **Guarda el reporte**: Confirma que el reporte se guarda en el historial.

### Paso 3: Configurar y Probar la Automatización (n8n)

Ahora, vamos a conectar tu flujo externo con tu nueva API.

1.  **Abre n8n** y crea un nuevo flujo de trabajo (workflow).
2.  **Usa el nodo `HTTP Request`**:
    *   **Method**: `POST`
    *   **URL**: Usa la URL de tu API.
        *   Para pruebas locales: `http://localhost:9002/api/manage-product`
        *   Para producción: `https://eymitiendaweb.com/api/manage-product`
    *   **Authentication**: `Header Auth`.
    *   **Name**: `Authorization`.
    *   **Value**: `Bearer TU_INTERNAL_API_KEY` (reemplaza `TU_INTERNAL_API_KEY` con la clave que inventaste y pusiste en el archivo `.env`).
    *   **Body Content Type**: `JSON`.
    *   **Body**: Aquí es donde defines la acción.
        *   **Para despublicar (eliminar de la vista pública):**
            ```json
            {
              "sku": "SKU-DEL-PRODUCTO",
              "action": "unpublish"
            }
            ```
        *   **Para pausar por 15 minutos:**
            ```json
            {
              "sku": "SKU-DEL-PRODUCTO",
              "action": "pause",
              "pause_duration_minutes": 15
            }
            ```
3.  **Ejecuta el flujo en n8n**: Al ejecutarlo, deberías ver que el producto correspondiente cambia su estado de visibilidad en tu panel de "ey mi tienda web!".

### Paso 4 (Opcional Avanzado): Activar la Republicación Automática

Para que los productos pausados temporalmente se reactiven solos, necesitas una tarea programada ("Cron Job").

1.  **Ve a Supabase**: En tu proyecto, ve a `Database` > `Cron Jobs`.
2.  **Crea un nuevo Job**:
    *   **Name**: `Product Republisher`.
    *   **Schedule**: `*/5 * * * *` (esto significa que se ejecutará cada 5 minutos).
    *   **SQL a ejecutar**:
        ```sql
        UPDATE public.products
        SET 
          visible = true,
          scheduled_republish_at = NULL
        WHERE 
          visible = false 
          AND scheduled_republish_at IS NOT NULL 
          AND scheduled_republish_at <= now();
        ```
3.  **Guarda el Cron Job**.

Este job revisará cada 5 minutos si hay algún producto que deba ser republicado y lo hará automáticamente.

---

¡Y eso es todo! Siguiendo estos pasos, tendrás una aplicación completamente funcional con un sistema de automatización de nivel profesional.
