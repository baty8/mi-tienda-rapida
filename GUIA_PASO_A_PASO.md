
# Guía de Pasos Finales para "ey mi tienda web!"

¡Felicitaciones! Has completado la configuración de las claves de entorno. Tu aplicación está casi lista. Sigue esta guía para poner todo en marcha.

---

### **Paso 1: Configurar la Base de Datos (¡Acción Requerida!)**

Para que la automatización de "pausar/despublicar" productos funcione, necesitas añadir dos columnas a tu tabla `products` en Supabase. **Este paso es obligatorio**.

1.  Ve a tu proyecto en [Supabase.io](https://supabase.io).
2.  En el menú de la izquierda, haz clic en **Table Editor**.
3.  Selecciona la tabla `products`.
4.  Haz clic en el botón **Add column** (o "+ Column") dos veces para añadir las siguientes columnas:

    *   **Columna 1:**
        *   **Name**: `sku`
        *   **Type**: `text`
        *   Deja el resto de las opciones por defecto y haz clic en **Save**.

    *   **Columna 2:**
        *   **Name**: `scheduled_republish_at`
        *   **Type**: `timestamp with time zone` (puedes buscarlo como `timestamptz`).
        *   En **Default Value**, selecciona `NULL`.
        *   Activa la opción **Is Nullable**.
        *   Haz clic en **Save**.

¡Listo! Tu base de datos ya está preparada para la automatización.

---

### **Paso 2: Probar la Aplicación Principal**

Ahora que las claves y la base de datos están listas, es hora de probar.

1.  **Inicia la aplicación** si aún no lo has hecho.
2.  **Añade o edita un producto**: Asegúrate de que ahora ves un campo para el **SKU**. Asígnale un SKU único a un producto de prueba (ej: `PROD-001`).
3.  **Genera un reporte**: Ve a la sección "Reportes Inteligentes", elige una plantilla y genera un reporte para confirmar que tu `GEMINI_API_KEY` funciona.
4.  **Guarda el reporte**: Haz clic en "Guardar Reporte" y verifica que aparece en el historial.

---

### **Paso 3: Configurar la Automatización en n8n**

Este es el núcleo de tu idea de automatización. Aquí te explico cómo configurar n8n para que se comunique con tu nueva API.

1.  **Crea un nuevo workflow en n8n.**
2.  **Añade un nodo `HTTP Request`**.
3.  **Configura el nodo de la siguiente manera:**
    *   **Method**: `POST`
    *   **URL**: La URL completa de tu endpoint. Será `https://[tu-dominio-de-produccion]/api/manage-product`.
    *   **Authentication**: `Header Auth`.
    *   **Name**: `Authorization`
    *   **Value**: `Bearer TU_INTERNAL_API_KEY_SECRETA` (reemplaza `TU_INTERNAL_API_KEY_SECRETA` con la clave que inventaste y pusiste en el archivo `.env`).
    *   **Body Content Type**: `JSON`.
    *   **JSON/RAW**: Sí.

4.  **Configura el Cuerpo (Body) de la petición:**
    El cuerpo debe ser un JSON que contenga el `sku` y la `action`. Puedes usar expresiones de n8n para tomar estos valores desde una planilla de Google o un mensaje de WhatsApp.

    *   **Para despublicar un producto:**
        ```json
        {
          "sku": "PROD-001",
          "action": "unpublish"
        }
        ```

    *   **Para pausar un producto (despublicarlo temporalmente):**
        ```json
        {
          "sku": "PROD-002",
          "action": "pause"
        }
        ```

Al ejecutar este nodo en n8n, el producto correspondiente en tu tienda se despublicará.

---

### **Paso 4 (Opcional): Activar la Republicación Automática (Cron Job)**

Para que la acción `pause` vuelva a publicar el producto automáticamente, necesitas una tarea programada que revise la columna `scheduled_republish_at`. Supabase ofrece `pg_cron` para esto.

1.  **Ve a tu proyecto de Supabase.**
2.  En el menú de la izquierda, ve a **Database** -> **Cron Jobs**.
3.  Crea un nuevo **Cron Job**.
    *   **Name**: `republish_paused_products`
    *   **Schedule**: `*/5 * * * *` (Esto ejecutará la tarea cada 5 minutos. Puedes ajustarlo).
    *   **Function**: Pega el siguiente código SQL:
        ```sql
        UPDATE public.products
        SET visible = true, scheduled_republish_at = NULL
        WHERE visible = false
          AND scheduled_republish_at IS NOT NULL
          AND scheduled_republish_at <= now();
        ```
4.  **Guarda el Cron Job.**

Con esto, el sistema revisará cada 5 minutos si algún producto pausado debe ser republicado y lo hará automáticamente.

---

¡Y eso es todo! Has construido una aplicación completa con una potente capacidad de automatización. Si tienes alguna otra duda, no dudes en preguntar.
