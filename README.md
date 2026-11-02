# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## Customer categories

The customer homepage reads active categories from the Supabase `public.categories` table. To allow visitors to read only published categories when row-level security is enabled, add a SELECT policy in the Supabase SQL Editor:

```sql
create policy "Anyone can view active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);
```

For immediate updates while the homepage is open, enable the `categories` table for Supabase Realtime. The homepage still loads the latest categories on each visit if Realtime is not enabled.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
