/*
# Tighten administrator approval table privileges

1. Modified Table
- `velva_admins`: approval records remain readable only by the signed-in account matching the row.

2. Security Changes
- Anonymous users cannot reach the administrator approval table.
- Authenticated browsers receive only the SELECT privilege needed to check their own approval.
- Inserts and updates remain server-side administrative operations.
*/

REVOKE ALL ON public.velva_admins FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.velva_admins FROM authenticated;
GRANT SELECT ON public.velva_admins TO authenticated;
