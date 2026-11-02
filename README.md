# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Customer catalog

The customer homepage and products page read active categories and products from Supabase. To allow visitors to read only published records when row-level security is enabled, add SELECT policies in the Supabase SQL Editor:

```sql
create policy "Anyone can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Anyone can view active products"
on public.products
for select
to anon, authenticated
using (is_active = true);
```

The migration [`supabase/migrations/20261102000000_enable_customer_catalog_realtime.sql`](./supabase/migrations/20261102000000_enable_customer_catalog_realtime.sql) adds `categories` and `products` to Supabase Realtime. Apply it to the same Supabase project used by the deployed site (for example, run its SQL in the Supabase Dashboard SQL Editor). The customer home and products pages then refresh while open after admin changes. Order tracking securely rechecks the order status every five seconds while the customer is viewing a tracked order.

## Admin dashboard

Deploy/redeploy the Vite app to Vercel with the `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` environment variables set for the Production environment. [`vercel.json`](./vercel.json) rewrites direct route requests to the SPA, so the admin login also works at `https://<your-vercel-domain>/admin` on any device.

Administrators sign in at `/admin`. After login, the secured dashboard at `/admin/dashboard` brings together overview, category management, product management, and order management. The customer website does not display a dashboard link; the dashboard is rendered only after verifying the signed-in user's `profiles.role` is `admin`. The dashboard includes a link back to the customer website. Admin changes are saved in the shared Supabase project, so they are available to all visitors, not just the admin's device.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
