-- ============================================
-- 1. CRÉATION DES ENUMS (types personnalisés)
-- ============================================

-- Statut des consultations
CREATE TYPE consultation_status AS ENUM ('pending', 'assigned', 'in_progress', 'completed', 'cancelled');

-- Statut des commandes
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Statut des paiements
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Statut des produits
CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');

-- Statut des avis
CREATE TYPE review_status AS ENUM ('pending', 'approved', 'rejected');

-- Rôle des utilisateurs
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'advisor', 'client', 'visitor');

-- Type de code promo
CREATE TYPE promo_type AS ENUM ('percentage', 'fixed_amount');

-- Type de transaction fidélité
CREATE TYPE loyalty_type AS ENUM ('earned', 'spent', 'expired');

-- Type de notification
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'in_app');

-- Type de paiement
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'mobile_money', 'bank_transfer');

-- ============================================
-- 2. CRÉATION DES TABLES
-- ============================================

-- Profiles (lié à auth.users)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  first_name text,
  last_name text,
  phone text,
  avatar_url text,
  role user_role DEFAULT 'client',
  loyalty_points integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Addresses
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text,
  street text NOT NULL,
  city text NOT NULL,
  state text,
  zip_code text,
  country text NOT NULL DEFAULT 'France',
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Categories
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  image_url text,
  parent_id uuid,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Products
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  category_id uuid,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  composition text,
  origin_country text,
  base_price numeric NOT NULL,
  discount_price numeric,
  stock_quantity integer DEFAULT 0,
  sku text NOT NULL UNIQUE,
  status product_status DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  tags text[],
  meta_title text,
  meta_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL
);

-- Product Images
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  url text NOT NULL,
  alt_text text,
  is_primary boolean DEFAULT false,
  sort_order integer DEFAULT 0,
  CONSTRAINT product_images_pkey PRIMARY KEY (id),
  CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Product Variants
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  color text,
  size text,
  additional_price numeric DEFAULT 0,
  stock_quantity integer DEFAULT 0,
  sku_variant text UNIQUE,
  CONSTRAINT product_variants_pkey PRIMARY KEY (id),
  CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Carts
CREATE TABLE public.carts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  session_id text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT carts_pkey PRIMARY KEY (id),
  CONSTRAINT carts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Cart Items
CREATE TABLE public.cart_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL,
  product_id uuid NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  CONSTRAINT cart_items_pkey PRIMARY KEY (id),
  CONSTRAINT cart_items_cart_id_fkey FOREIGN KEY (cart_id) REFERENCES public.carts(id) ON DELETE CASCADE,
  CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT cart_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);

-- Promo Codes
CREATE TABLE public.promo_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type promo_type NOT NULL,
  value numeric NOT NULL,
  min_order_amount numeric,
  max_uses integer,
  used_count integer DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT promo_codes_pkey PRIMARY KEY (id)
);

-- Orders
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  address_id uuid,
  status order_status DEFAULT 'pending',
  total_amount numeric NOT NULL,
  discount_amount numeric DEFAULT 0,
  shipping_amount numeric DEFAULT 0,
  promo_code_id uuid,
  tracking_number text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT orders_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id),
  CONSTRAINT orders_promo_code_id_fkey FOREIGN KEY (promo_code_id) REFERENCES public.promo_codes(id)
);

-- Order Items
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  product_id uuid NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL,
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.product_variants(id)
);

-- Payments
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL,
  provider payment_provider NOT NULL,
  provider_payment_id text,
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR',
  status payment_status DEFAULT 'pending',
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

-- Consultations
CREATE TABLE public.consultations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  advisor_id uuid,
  event_type text NOT NULL,
  event_date date,
  budget numeric,
  preferences text,
  reference_images text[],
  status consultation_status DEFAULT 'pending',
  client_message text,
  advisor_response text,
  recommended_products uuid[],
  created_at timestamp with time zone DEFAULT now(),
  responded_at timestamp with time zone,
  CONSTRAINT consultations_pkey PRIMARY KEY (id),
  CONSTRAINT consultations_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id),
  CONSTRAINT consultations_advisor_id_fkey FOREIGN KEY (advisor_id) REFERENCES public.profiles(id)
);

-- Favorites
CREATE TABLE public.favorites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT favorites_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE
);

-- Reviews
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  user_id uuid NOT NULL,
  order_item_id uuid,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  status review_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE,
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT reviews_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id)
);

-- Loyalty Transactions
CREATE TABLE public.loyalty_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  order_id uuid,
  type loyalty_type NOT NULL,
  points integer NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT loyalty_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT loyalty_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT loyalty_transactions_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type notification_type NOT NULL,
  subject text,
  content text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- ============================================
-- 3. CRÉATION DES INDEX (pour les performances)
-- ============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_cart_items_cart_id ON public.cart_items(cart_id);
CREATE INDEX idx_consultations_client_id ON public.consultations(client_id);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_favorites_user_id ON public.favorites(user_id);

-- ============================================
-- 4. TRIGGER POUR METTRE À JOUR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();