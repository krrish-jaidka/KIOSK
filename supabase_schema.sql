-- ========================================
-- The Digital Grill — Supabase Schema (INR)
-- Run this in your Supabase SQL Editor
-- ========================================

-- 1. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  rating NUMERIC(2,1) DEFAULT 4.5,
  tags TEXT[] DEFAULT '{}',
  customizations JSONB DEFAULT '[]',
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'takeaway')),
  subtotal NUMERIC(10,2) NOT NULL,
  tax NUMERIC(10,2) NOT NULL,
  service_fee NUMERIC(10,2) DEFAULT 30.00,
  total NUMERIC(10,2) NOT NULL,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id TEXT REFERENCES menu_items(id),
  item_name TEXT NOT NULL,
  item_price NUMERIC(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  customizations JSONB DEFAULT '[]',
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- Row Level Security (RLS) Policies
-- ========================================

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Menu items: anyone can read
DROP POLICY IF EXISTS "Anyone can read menu items" ON menu_items;
CREATE POLICY "Anyone can read menu items"
  ON menu_items FOR SELECT
  USING (true);

-- Orders: anyone can insert (kiosk is public)
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Orders: anyone can read (for confirmation page)
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  USING (true);

-- Order items: anyone can insert
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Order items: anyone can read
DROP POLICY IF EXISTS "Anyone can read order items" ON order_items;
CREATE POLICY "Anyone can read order items"
  ON order_items FOR SELECT
  USING (true);

-- ========================================
-- Seed Menu Data
-- ========================================

-- First, delete old USD data so we can re-insert INR cleanly
TRUNCATE TABLE menu_items CASCADE;

INSERT INTO menu_items (id, name, description, price, category, image, rating, tags, customizations) VALUES
-- Burgers
('b1', 'Classic Cheeseburger', 'Juicy grass-fed beef patty with melted aged cheddar, secret house sauce, and crispy lettuce on a brioche bun.', 349.00, 'Burgers', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800&h=600', 4.8, ARRAY[]::TEXT[], '[{"name":"Extra Cheese","price":40},{"name":"Add Bacon","price":90},{"name":"No Onions","price":0},{"name":"Extra Patty","price":150}]'::JSONB),
('b2', 'Double Bacon Smash', 'Two smashed beef patties, crispy applewood smoked bacon, and caramelized onions.', 449.00, 'Burgers', 'https://images.unsplash.com/photo-1594212202815-56d11f7cbbb2?auto=format&fit=crop&q=80&w=800&h=600', 4.9, ARRAY[]::TEXT[], '[{"name":"Extra Cheese","price":40},{"name":"Add Jalapeños","price":30},{"name":"Extra Bacon","price":90}]'::JSONB),
('b3', 'Veggie Supreme', 'House-made chickpea and quinoa patty, smashed avocado, and garden fresh sprouts.', 299.00, 'Burgers', 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=800&h=600', 4.6, ARRAY['Vegetarian'], '[{"name":"Extra Avocado","price":60},{"name":"Add Vegan Cheese","price":50},{"name":"Gluten-Free Bun","price":40}]'::JSONB),
('b4', 'Inferno Burger', 'Habanero jack cheese, fresh jalapeños, and spicy sriracha mayo on a toasted bun.', 399.00, 'Burgers', 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800&h=600', 4.7, ARRAY['Spicy'], '[{"name":"Extra Jalapeños","price":20},{"name":"Mild Spice","price":0},{"name":"Extra Hot","price":0}]'::JSONB),

-- Pizza
('p1', 'Margherita Pizza', 'Classic pizza with San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.', 499.00, 'Pizza', 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=800&h=600', 4.7, ARRAY['Vegetarian'], '[{"name":"Extra Cheese","price":80},{"name":"Add Olives","price":40},{"name":"Thin Crust","price":0},{"name":"Stuffed Crust","price":100}]'::JSONB),
('p2', 'Pepperoni Feast', 'Loaded with double pepperoni, mozzarella blend, and a rich tomato base on hand-tossed dough.', 599.00, 'Pizza', 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800&h=600', 4.8, ARRAY[]::TEXT[], '[{"name":"Extra Pepperoni","price":80},{"name":"Add Mushrooms","price":40},{"name":"Stuffed Crust","price":100}]'::JSONB),
('p3', 'BBQ Chicken Pizza', 'Smokey BBQ sauce, grilled chicken, red onions, and cilantro on a crispy golden crust.', 649.00, 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800&h=600', 4.6, ARRAY[]::TEXT[], '[{"name":"Extra Chicken","price":120},{"name":"Add Jalapeños","price":30},{"name":"Spicy BBQ","price":0}]'::JSONB),
('p4', 'Veggie Garden Pizza', 'Bell peppers, mushrooms, olives, artichokes, and sun-dried tomatoes on pesto base.', 549.00, 'Pizza', 'https://images.unsplash.com/photo-1541745537411-b8046bc6e662?auto=format&fit=crop&q=80&w=800&h=600', 4.5, ARRAY['Vegetarian'], '[{"name":"Extra Veggies","price":60},{"name":"Add Feta","price":70},{"name":"Gluten-Free Crust","price":80}]'::JSONB),

-- Beverages
('bv1', 'Vanilla Milkshake', 'Creamy vanilla bean milkshake topped with whipped cream and a cherry on top.', 249.00, 'Beverages', 'https://images.unsplash.com/photo-1579954115567-dff2eeb6fde9?auto=format&fit=crop&q=80&w=800&h=600', 4.7, ARRAY[]::TEXT[], '[{"name":"Extra Whipped Cream","price":30},{"name":"Add Chocolate Drizzle","price":20},{"name":"Make it Large","price":80}]'::JSONB),
('bv2', 'Peach Iced Tea', 'Refreshing cold-brewed iced tea with real peach nectar and a hint of lemon.', 179.00, 'Beverages', 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800&h=600', 4.5, ARRAY[]::TEXT[], '[{"name":"Less Ice","price":0},{"name":"Extra Sweet","price":0},{"name":"Add Lemon Slice","price":10}]'::JSONB),
('bv3', 'Fresh Lemonade', 'Hand-squeezed lemonade with a touch of mint and raw honey sweetener.', 149.00, 'Beverages', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800&h=600', 4.4, ARRAY[]::TEXT[], '[{"name":"Add Mint","price":0},{"name":"Less Sugar","price":0},{"name":"Make it Large","price":50}]'::JSONB),
('bv4', 'Espresso Frappe', 'Double-shot espresso blended with ice, milk, and a hint of vanilla syrup.', 279.00, 'Beverages', 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800&h=600', 4.8, ARRAY[]::TEXT[], '[{"name":"Extra Shot","price":50},{"name":"Oat Milk","price":40},{"name":"Caramel Drizzle","price":20}]'::JSONB),

-- Desserts
('d1', 'Chocolate Lava Cake', 'Warm, rich chocolate cake with a molten center, served with vanilla ice cream.', 349.00, 'Desserts', 'https://images.unsplash.com/photo-1624353365286-cb18d6ee4dce?auto=format&fit=crop&q=80&w=800&h=600', 4.9, ARRAY[]::TEXT[], '[{"name":"Extra Ice Cream Scoop","price":60},{"name":"Add Berries","price":50},{"name":"Whipped Cream","price":30}]'::JSONB),
('d2', 'New York Cheesecake', 'Creamy classic cheesecake with a buttery graham cracker crust and berry compote.', 329.00, 'Desserts', 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800&h=600', 4.6, ARRAY['Vegetarian'], '[{"name":"Extra Berry Compote","price":40},{"name":"Chocolate Drizzle","price":30}]'::JSONB),
('d3', 'Tiramisu', 'Layers of espresso-soaked ladyfingers, mascarpone cream, and cocoa dusting.', 379.00, 'Desserts', 'https://images.unsplash.com/photo-1571115177098-24de41270498?auto=format&fit=crop&q=80&w=800&h=600', 4.8, ARRAY['Vegetarian'], '[{"name":"Extra Cocoa","price":0},{"name":"Add Espresso Shot","price":50}]'::JSONB),
('d4', 'Churros with Dip', 'Cinnamon-sugar dusted churros served with warm chocolate and caramel dipping sauces.', 249.00, 'Desserts', 'https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&q=80&w=800&h=600', 4.7, ARRAY['Vegetarian'], '[{"name":"Extra Chocolate Dip","price":40},{"name":"Add Strawberry Dip","price":40},{"name":"Extra Churros (3pc)","price":90}]'::JSONB),

-- Combo Meals
('c1', 'The Big Combo', 'Classic Cheeseburger served with large sea salt fries and your choice of large beverage.', 549.00, 'Combo Meals', 'https://images.unsplash.com/photo-1594212202931-15b9c0bdbe3c?auto=format&fit=crop&q=80&w=800&h=600', 4.9, ARRAY['Best Value'], '[{"name":"Upgrade to Onion Rings","price":50},{"name":"Add Milkshake Instead","price":80}]'::JSONB),
('c2', 'Pizza Party Pack', 'Any large pizza with garlic bread, a side salad, and 2 soft drinks for sharing.', 899.00, 'Combo Meals', 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&q=80&w=800&h=600', 4.7, ARRAY['Best Value'], '[{"name":"Upgrade to Premium Pizza","price":100},{"name":"Add Dessert","price":150}]'::JSONB),
('c3', 'Family Feast', '4 Classic Burgers, 2 large fries, 4 drinks, and 4 cookies — feeds the whole family.', 1499.00, 'Combo Meals', 'https://images.unsplash.com/photo-1632313620959-1bd1b8dbffeb?auto=format&fit=crop&q=80&w=800&h=600', 4.8, ARRAY['Best Value'], '[{"name":"Upgrade Burgers to Bacon","price":200},{"name":"Add Milkshakes","price":250}]'::JSONB),
('c4', 'Snack Attack', 'Chicken tenders, mozzarella sticks, fries, and a refreshing lemonade.', 449.00, 'Combo Meals', 'https://images.unsplash.com/photo-1626244346850-8bbf7bbf371d?auto=format&fit=crop&q=80&w=800&h=600', 4.5, ARRAY[]::TEXT[], '[{"name":"Swap Fries for Onion Rings","price":30},{"name":"Add Dipping Sauce","price":20}]'::JSONB)

ON CONFLICT (id) DO UPDATE SET 
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  customizations = EXCLUDED.customizations;
