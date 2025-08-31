
# Diagrama de Clases Conceptual de VentaRapida

Este documento describe la arquitectura de la aplicación, mostrando sus componentes principales y cómo se relacionan entre sí. Funciona como un diagrama de clases conceptual adaptado a una aplicación web moderna con React/Next.js.

---

### 1. Tipos de Datos (Modelos)

Representan las estructuras de datos fundamentales que maneja la aplicación.

-   **`Profile`**:
    -   **Atributos**: `id`, `name`, `email`, `avatar_url`, `store_description`, `store_banner_url`, colores y fuentes de la tienda.
    -   **Descripción**: Representa la información del vendedor y la configuración de su tienda pública.

-   **`Product`**:
    -   **Atributos**: `id`, `user_id`, `name`, `description`, `price`, `cost`, `stock`, `visible`, `image_urls`.
    -   **Relación**: Asociado a un `Profile` (muchos a uno).
    -   **Descripción**: Representa un artículo individual en el inventario.

-   **`Catalog`**:
    -   **Atributos**: `id`, `user_id`, `name`, `is_public`, `product_ids`.
    -   **Relación**: Asociado a un `Profile` (muchos a uno) y contiene múltiples `Product` (muchos a muchos, a través de `product_ids`).
    -   **Descripción**: Agrupa productos para organizarlos y mostrarlos en la tienda.

-   **`Report`**:
    -   **Atributos**: `id`, `user_id`, `report_type`, `content`, `generated_at`.
    -   **Relación**: Asociado a un `Profile` (muchos a uno).
    -   **Descripción**: Almacena un reporte de IA generado y guardado por el usuario.

---

### 2. Gestores de Estado (Contextos de React)

Actúan como los controladores centrales que manejan la lógica de negocio y el estado de la aplicación en el lado del cliente.

-   **`ProductProvider`** (accesado vía `useProduct`):
    -   **Estado que gestiona**: `products[]`, `catalogs[]`, `profile`, `loading`.
    -   **Métodos (Operaciones)**: `fetchInitialProfile()`, `addProduct()`, `updateProduct()`, `deleteProduct()`, `createCatalog()`, `saveCatalog()`, `deleteCatalog()`.
    -   **Responsabilidad**: Es el corazón del panel de vendedor. Se comunica con **Supabase** para todas las operaciones CRUD (Crear, Leer, Actualizar, Borrar) sobre productos, catálogos y perfiles, y provee estos datos a todos los componentes que lo necesiten.

-   **`CartProvider`** (accesado vía `useCart`):
    -   **Estado que gestiona**: `cart[]` (una lista de productos y cantidades).
    -   **Métodos (Operaciones)**: `addToCart()`, `removeFromCart()`, `updateQuantity()`.
    -   **Responsabilidad**: Gestiona el estado del carrito de compras exclusivamente en la vista de la tienda pública (`/store/[vendorId]`).

---

### 3. Flujos de Inteligencia Artificial (Backend Lógico)

Son los agentes especializados que procesan datos y generan contenido inteligente.

-   **`reportGeneratorFlow`**:
    -   **Atributos (Entrada)**: `reportType`, `products[]`.
    -   **Métodos (Internos)**: `catalogPrompt()`, `stockPrompt()`, `pricingMarginsPrompt()`.
    -   **Responsabilidad**: Recibe una lista de productos y un tipo de reporte. Utiliza el modelo de IA **Gemini (via Genkit)** para analizar los datos y generar el contenido del reporte en formato Markdown. Es invocado desde la página de Reportes.

---

### 4. Componentes de Interfaz (Páginas y UI)

Representan las vistas que el usuario final ve y con las que interactúa.

-   **Páginas del Panel (`/app/(vendor)/...`)**:
    -   `ProductsPage`: Muestra la `ProductTable` y el diálogo `AddProductDialog`. Depende de `useProduct`.
    -   `DashboardPage`: Muestra tarjetas de estadísticas y gráficos (`TopProductsChart`). Depende de `useProduct`.
    -   `CatalogPage`: Permite crear, editar y asignar productos a los catálogos. Depende de `useProduct`.
    -   `FinancePage`: Muestra métricas financieras y una calculadora de márgenes. Depende de `useProduct`.
    -   `ReportsPage`: Permite al usuario seleccionar un tipo de reporte, invocar a `reportGeneratorFlow` y ver/guardar el resultado. Depende de `useProduct`.
    -   `ProfilePage`: Permite al usuario editar su `Profile`. Depende de `useProduct`.

-   **Página de la Tienda Pública (`/app/store/[vendorId]/...`)**:
    -   `StoreClientContent`: Renderiza la tienda completa del vendedor, incluyendo la lista de productos de catálogos públicos y el carrito de compras. Depende de `useCart` para la gestión del carrito.

-   **Componentes Reutilizables (`/components/...`)**:
    -   `ProductTable`: Tabla que muestra los productos con opciones para editar y borrar. Usada en `ProductsPage`.
    -   `AddProductDialog` / `EditProductDialog`: Formularios modales para crear/editar productos.
    -   `Sidebar`: Menú de navegación principal del panel de vendedor.
    -   `TopProductsChart`: Gráfico que visualiza los productos destacados.
    -   **Componentes de UI**: `Button`, `Card`, `Input`, etc. (Bloques de construcción visuales de ShadCN/UI).
