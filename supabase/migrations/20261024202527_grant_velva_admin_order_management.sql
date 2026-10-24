/*
# Grant approved administrators order management access

1. Modified Table
- `velva_orders`: approved administrators can view and update order status for store operations.
- Customers retain access only to their own orders.

2. Security Changes
- Access is checked against `velva_admins` and the current authenticated user.
- Anonymous visitors receive no order access.
- No order deletion permission is added for administrators through the browser.
*/

DROP POLICY IF EXISTS "Customers can view own orders" ON public.velva_orders;
CREATE POLICY "Customers and admins can view orders"
ON public.velva_orders FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.velva_admins WHERE velva_admins.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Customers can update own orders" ON public.velva_orders;
CREATE POLICY "Customers and admins can update orders"
ON public.velva_orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.velva_admins WHERE velva_admins.user_id = auth.uid())
)
WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM public.velva_admins WHERE velva_admins.user_id = auth.uid())
);
