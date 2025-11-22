-- Fix RLS policies for admin to see all users
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;

CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (
  (auth.uid() = user_id) OR 
  is_admin(auth.uid())
);

-- Add policy for admins to view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  (auth.uid() = id) OR 
  is_admin(auth.uid())
);

-- Create function to auto-delete cancelled orders after 24 hours
CREATE OR REPLACE FUNCTION delete_old_cancelled_orders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.orders
  WHERE status = 'cancelled'
  AND updated_at < NOW() - INTERVAL '24 hours';
END;
$$;