-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.order_status AS ENUM ('pending', 'ordered', 'shipping', 'completed', 'cancelled', 'awaiting_payment');
CREATE TYPE public.payment_status AS ENUM ('unpaid', 'paid', 'refunded');
CREATE TYPE public.voucher_type AS ENUM ('free', 'paid');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = is_admin.user_id
      AND role = 'admin'
  )
$$;

-- Create vouchers table
CREATE TABLE public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  voucher_type voucher_type NOT NULL,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active vouchers"
  ON public.vouchers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage vouchers"
  ON public.vouchers FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  product_link TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  voucher_id UUID REFERENCES public.vouchers(id),
  recipient_name TEXT NOT NULL,
  phone_or_contact TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT,
  notes TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'unpaid',
  tracking_code TEXT,
  admin_notes TEXT,
  service_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete orders"
  ON public.orders FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Create order_edit_requests table
CREATE TABLE public.order_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  new_recipient_name TEXT NOT NULL,
  new_phone_or_contact TEXT NOT NULL,
  new_address TEXT NOT NULL,
  new_notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.order_edit_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create edit requests"
  ON public.order_edit_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view edit requests for their orders"
  ON public.order_edit_requests FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage edit requests"
  ON public.order_edit_requests FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create support_tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code TEXT NOT NULL,
  description TEXT NOT NULL,
  contact_link TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tickets"
  ON public.support_tickets FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON public.site_settings FOR ALL
  USING (public.is_admin(auth.uid()));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('banner_enabled', 'false'),
  ('banner_text', ''),
  ('banner_color', '#EE4D2D'),
  ('daily_order_limit', '100');

-- Create trigger for profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate unique order code
CREATE OR REPLACE FUNCTION public.generate_order_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'ANI' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    
    SELECT EXISTS(SELECT 1 FROM public.orders WHERE order_code = new_code) INTO code_exists;
    
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Create banned_users table
CREATE TABLE public.banned_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  banned_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage banned users"
  ON public.banned_users FOR ALL
  USING (public.is_admin(auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_order_edit_requests_updated_at
  BEFORE UPDATE ON public.order_edit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();