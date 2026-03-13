// ========================================
// The Digital Grill — Menu Data (INR)
// ========================================

const TAX_RATE = 0.05; // 5% GST
const SERVICE_FEE = 30.00; // Flat ₹30 fee

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'restaurant' },
  { id: 'burgers', name: 'Burgers', icon: 'lunch_dining' },
  { id: 'pizza', name: 'Pizza', icon: 'local_pizza' },
  { id: 'beverages', name: 'Beverages', icon: 'local_drink' },
  { id: 'desserts', name: 'Desserts', icon: 'icecream' },
  { id: 'combo', name: 'Combo Meals', icon: 'fastfood' }
];

const MENU_DATA = [
  // ── BURGERS ──
  {
    id: 'b1',
    name: 'Classic Cheeseburger',
    description: 'Juicy grass-fed beef patty with melted aged cheddar, secret house sauce, and crispy lettuce on a brioche bun.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Burgers',
    rating: 4.8,
    tags: [],
    customizations: [
      { name: 'Extra Cheese', price: 40 },
      { name: 'Add Bacon', price: 90 },
      { name: 'No Onions', price: 0 },
      { name: 'Extra Patty', price: 150 }
    ]
  },
  {
    id: 'b2',
    name: 'Double Bacon Smash',
    description: 'Two smashed beef patties, crispy applewood smoked bacon, and caramelized onions.',
    price: 449,
    image: 'https://images.unsplash.com/photo-1594212202815-56d11f7cbbb2?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Burgers',
    rating: 4.9,
    tags: [],
    customizations: [
      { name: 'Extra Cheese', price: 40 },
      { name: 'Add Jalapeños', price: 30 },
      { name: 'Extra Bacon', price: 90 }
    ]
  },
  {
    id: 'b3',
    name: 'Veggie Supreme',
    description: 'House-made chickpea and quinoa patty, smashed avocado, and garden fresh sprouts.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Burgers',
    rating: 4.6,
    tags: ['Vegetarian'],
    customizations: [
      { name: 'Extra Avocado', price: 60 },
      { name: 'Add Vegan Cheese', price: 50 },
      { name: 'Gluten-Free Bun', price: 40 }
    ]
  },
  {
    id: 'b4',
    name: 'Inferno Burger',
    description: 'Habanero jack cheese, fresh jalapeños, and spicy sriracha mayo on a toasted bun.',
    price: 399,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Burgers',
    rating: 4.7,
    tags: ['Spicy'],
    customizations: [
      { name: 'Extra Jalapeños', price: 20 },
      { name: 'Mild Spice', price: 0 },
      { name: 'Extra Hot', price: 0 }
    ]
  },

  // ── PIZZA ──
  {
    id: 'p1',
    name: 'Margherita Pizza',
    description: 'Classic pizza with San Marzano tomato sauce, fresh mozzarella, and aromatic basil leaves.',
    price: 499,
    image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Pizza',
    rating: 4.7,
    tags: ['Vegetarian'],
    customizations: [
      { name: 'Extra Cheese', price: 80 },
      { name: 'Add Olives', price: 40 },
      { name: 'Thin Crust', price: 0 },
      { name: 'Stuffed Crust', price: 100 }
    ]
  },
  {
    id: 'p2',
    name: 'Pepperoni Feast',
    description: 'Loaded with double pepperoni, mozzarella blend, and a rich tomato base on hand-tossed dough.',
    price: 599,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Pizza',
    rating: 4.8,
    tags: [],
    customizations: [
      { name: 'Extra Pepperoni', price: 80 },
      { name: 'Add Mushrooms', price: 40 },
      { name: 'Stuffed Crust', price: 100 }
    ]
  },
  {
    id: 'p3',
    name: 'BBQ Chicken Pizza',
    description: 'Smokey BBQ sauce, grilled chicken, red onions, and cilantro on a crispy golden crust.',
    price: 649,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Pizza',
    rating: 4.6,
    tags: [],
    customizations: [
      { name: 'Extra Chicken', price: 120 },
      { name: 'Add Jalapeños', price: 30 },
      { name: 'Spicy BBQ', price: 0 }
    ]
  },
  {
    id: 'p4',
    name: 'Veggie Garden Pizza',
    description: 'Bell peppers, mushrooms, olives, artichokes, and sun-dried tomatoes on pesto base.',
    price: 549,
    image: 'https://images.unsplash.com/photo-1541745537411-b8046bc6e662?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Pizza',
    rating: 4.5,
    tags: ['Vegetarian'],
    customizations: [
      { name: 'Extra Veggies', price: 60 },
      { name: 'Add Feta', price: 70 },
      { name: 'Gluten-Free Crust', price: 80 }
    ]
  },

  // ── BEVERAGES ──
  {
    id: 'bv1',
    name: 'Vanilla Milkshake',
    description: 'Creamy vanilla bean milkshake topped with whipped cream and a cherry on top.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1579954115567-dff2eeb6fde9?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Beverages',
    rating: 4.7,
    tags: [],
    customizations: [
      { name: 'Extra Whipped Cream', price: 30 },
      { name: 'Add Chocolate Drizzle', price: 20 },
      { name: 'Make it Large', price: 80 }
    ]
  },
  {
    id: 'bv2',
    name: 'Peach Iced Tea',
    description: 'Refreshing cold-brewed iced tea with real peach nectar and a hint of lemon.',
    price: 179,
    image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Beverages',
    rating: 4.5,
    tags: [],
    customizations: [
      { name: 'Less Ice', price: 0 },
      { name: 'Extra Sweet', price: 0 },
      { name: 'Add Lemon Slice', price: 10 }
    ]
  },
  {
    id: 'bv3',
    name: 'Fresh Lemonade',
    description: 'Hand-squeezed lemonade with a touch of mint and raw honey sweetener.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Beverages',
    rating: 4.4,
    tags: [],
    customizations: [
      { name: 'Add Mint', price: 0 },
      { name: 'Less Sugar', price: 0 },
      { name: 'Make it Large', price: 50 }
    ]
  },
  {
    id: 'bv4',
    name: 'Espresso Frappe',
    description: 'Double-shot espresso blended with ice, milk, and a hint of vanilla syrup.',
    price: 279,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Beverages',
    rating: 4.8,
    tags: [],
    customizations: [
      { name: 'Extra Shot', price: 50 },
      { name: 'Oat Milk', price: 40 },
      { name: 'Caramel Drizzle', price: 20 }
    ]
  },

  // ── DESSERTS ──
  {
    id: 'd1',
    name: 'Chocolate Lava Cake',
    description: 'Warm, rich chocolate cake with a molten center, served with vanilla ice cream.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1624353365286-cb18d6ee4dce?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Desserts',
    rating: 4.9,
    tags: [],
    customizations: [
      { name: 'Extra Ice Cream Scoop', price: 60 },
      { name: 'Add Berries', price: 50 },
      { name: 'Whipped Cream', price: 30 }
    ]
  },
  {
    id: 'd2',
    name: 'New York Cheesecake',
    description: 'Creamy classic cheesecake with a buttery graham cracker crust and berry compote.',
    price: 329,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Desserts',
    rating: 4.6,
    tags: ['Vegetarian'],
    customizations: [
      { name: 'Extra Berry Compote', price: 40 },
      { name: 'Chocolate Drizzle', price: 30 }
    ]
  },
  {
    id: 'd3',
    name: 'Tiramisu',
    description: 'Layers of espresso-soaked ladyfingers, mascarpone cream, and cocoa dusting.',
    price: 379,
    image: 'https://images.unsplash.com/photo-1571115177098-24de41270498?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Desserts',
    rating: 4.8,
    tags: ['Vegetarian'],
    customizations: [
      { name: 'Extra Cocoa', price: 0 },
      { name: 'Add Espresso Shot', price: 50 }
    ]
  },
  {
    id: 'd4',
    name: 'Churros with Dip',
    description: 'Cinnamon-sugar dusted churros served with warm chocolate and caramel dipping sauces.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1624371414361-e670edf4898d?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Desserts',
    rating: 4.7,
    tags: ['Vegetarian'],
    customizations: [
      { name: 'Extra Chocolate Dip', price: 40 },
      { name: 'Add Strawberry Dip', price: 40 },
      { name: 'Extra Churros (3pc)', price: 90 }
    ]
  },

  // ── COMBO MEALS ──
  {
    id: 'c1',
    name: 'The Big Combo',
    description: 'Classic Cheeseburger served with large sea salt fries and your choice of large beverage.',
    price: 549,
    image: 'https://images.unsplash.com/photo-1594212202931-15b9c0bdbe3c?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Combo Meals',
    rating: 4.9,
    tags: ['Best Value'],
    customizations: [
      { name: 'Upgrade to Onion Rings', price: 50 },
      { name: 'Add Milkshake Instead', price: 80 }
    ]
  },
  {
    id: 'c2',
    name: 'Pizza Party Pack',
    description: 'Any large pizza with garlic bread, a side salad, and 2 soft drinks for sharing.',
    price: 899,
    image: 'https://images.unsplash.com/photo-1579684947550-22e945225d9a?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Combo Meals',
    rating: 4.7,
    tags: ['Best Value'],
    customizations: [
      { name: 'Upgrade to Premium Pizza', price: 100 },
      { name: 'Add Dessert', price: 150 }
    ]
  },
  {
    id: 'c3',
    name: 'Family Feast',
    description: '4 Classic Burgers, 2 large fries, 4 drinks, and 4 cookies — feeds the whole family.',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1632313620959-1bd1b8dbffeb?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Combo Meals',
    rating: 4.8,
    tags: ['Best Value'],
    customizations: [
      { name: 'Upgrade Burgers to Bacon', price: 200 },
      { name: 'Add Milkshakes', price: 250 }
    ]
  },
  {
    id: 'c4',
    name: 'Snack Attack',
    description: 'Chicken tenders, mozzarella sticks, fries, and a refreshing lemonade.',
    price: 449,
    image: 'https://images.unsplash.com/photo-1626244346850-8bbf7bbf371d?auto=format&fit=crop&q=80&w=800&h=600',
    category: 'Combo Meals',
    rating: 4.5,
    tags: [],
    customizations: [
      { name: 'Swap Fries for Onion Rings', price: 30 },
      { name: 'Add Dipping Sauce', price: 20 }
    ]
  }
];
