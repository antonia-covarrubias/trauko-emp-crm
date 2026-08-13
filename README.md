# Traukorp CRM

CRM liviano para Traukorp (venta de regalos corporativos de cuero
personalizados). Este es el esqueleto inicial del proyecto: login con
Supabase Auth y una página de prueba que confirma la conexión de lectura
a la base de datos real.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) para componentes
- [Supabase](https://supabase.com) (`@supabase/supabase-js` +
  `@supabase/ssr`) para autenticación y datos

## Estructura relevante

- `app/login/` — página de login (email + contraseña) y su server action.
  No hay registro público: los usuarios se crean manualmente desde
  Supabase Studio.
- `app/dashboard/` — página protegida que consulta la vista
  `vista_ventas_por_cliente` y la muestra en una tabla, ordenada por
  ingreso bruto descendente. Sirve como prueba de conexión de punta a
  punta con datos reales.
- `proxy.ts` — proxy de Next.js (equivalente a middleware) que protege
  todas las rutas excepto `/login`, redirigiendo a `/login` si no hay
  sesión activa.
- `lib/supabase/` — clientes de Supabase para browser (`client.ts`),
  Server Components / Route Handlers (`server.ts`) y el proxy
  (`middleware.ts`), siguiendo el patrón oficial de Supabase para Next.js
  App Router con cookies de sesión.

## Cómo correrlo en local

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia el archivo de variables de entorno de ejemplo:

   ```bash
   cp .env.local.example .env.local
   ```

3. Completa `.env.local` con las credenciales del proyecto Supabase (en
   Supabase Studio: **Project Settings → API**):

   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

   `.env.local` no se sube al repo (está en `.gitignore`).

4. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3000](http://localhost:3000). Te va a redirigir
   a `/login`. Inicia sesión con un usuario creado manualmente en Supabase
   Studio (**Authentication → Users**) para llegar a `/dashboard`.
