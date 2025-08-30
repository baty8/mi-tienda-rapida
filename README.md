# ey mi tienda web! - Panel de Vendedor

Esta es una aplicación web completa diseñada como un **panel de administración para vendedores de e-commerce**. Permite a los usuarios gestionar todos los aspectos clave de su tienda online de una manera sencilla e intuitiva.

## Funcionalidades Principales

-   **Autenticación Segura**: Los usuarios pueden registrarse e iniciar sesión con su correo electrónico y contraseña, o de forma más rápida usando su cuenta de Google. Incluye un flujo completo y seguro para restablecer la contraseña.
-   **Gestión de Productos**: Permite añadir, editar y eliminar productos fácilmente, controlando detalles como nombre, descripción, precio, costo, stock y visibilidad en la tienda pública.
-   **Catálogos Digitales**: Los vendedores pueden organizar sus productos en catálogos, personalizarlos y decidir cuáles hacer públicos para sus clientes.
-   **Tienda Pública Personalizable**: Cada vendedor obtiene una tienda online pública y personalizable. Pueden cambiar el nombre, la descripción, el logo, los colores y la tipografía para que coincida con su marca.
-   **Dashboard con Analíticas**: Un panel principal muestra estadísticas vitales como el valor total del inventario, el número de productos y alertas de stock bajo. También incluye gráficos para visualizar los productos más importantes.
-   **Asistentes con Inteligencia Artificial**: La aplicación utiliza IA para ayudar a los vendedores a tomar mejores decisiones, como sugerir precios óptimos para sus productos y analizar datos de ventas para ofrecer recomendaciones.

## Tecnologías Utilizadas

La aplicación está construida sobre un stack tecnológico moderno, robusto y escalable:

-   **Framework Principal**: **Next.js** (con App Router), que ofrece renderizado del lado del servidor y generación de sitios estáticos para un rendimiento y SEO óptimos.
-   **Lenguaje**: **TypeScript**, que añade un sistema de tipos robusto a JavaScript para mejorar la calidad y mantenibilidad del código.
-   **Interfaz de Usuario**: **React** para construir componentes de interfaz de usuario dinámicos y reutilizables.
-   **Componentes UI**: **ShadCN UI**, una colección de componentes accesibles y personalizables construidos sobre Radix UI.
-   **Estilos**: **Tailwind CSS**, un framework de CSS "utility-first" que permite estilizar la aplicación de forma rápida y consistente.
-   **Backend y Base de Datos**: **Supabase**, que proporciona una base de datos PostgreSQL, autenticación, almacenamiento de archivos y APIs autogeneradas.
-   **Inteligencia Artificial**: **Genkit** (de Google), un framework para construir flujos de IA que se integran con modelos como Gemini para potenciar las funcionalidades inteligentes de la aplicación.
-   **Gestión de Formularios**: **React Hook Form** y **Zod** para una gestión de formularios potente y con validación de esquemas.
-   **Gráficos y Visualizaciones**: **Recharts** para crear los gráficos interactivos del dashboard.

## Empezando

Para empezar a explorar la aplicación, el punto de entrada principal del panel de administración después de iniciar sesión es `src/app/(vendor)/products/page.tsx`.
