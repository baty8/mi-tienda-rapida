
-- Habilita RLS para la tabla de productos si aún no está habilitada
alter table "public"."products" enable row level security;

-- Elimina la política anterior si existe, para evitar conflictos
drop policy if exists "Public products are viewable by everyone." on "public"."products";

-- Crea una nueva política para permitir a cualquiera leer (SELECT) los productos
create policy "Public products are viewable by everyone."
on "public"."products" for select
to authenticated, anon
using (true);
