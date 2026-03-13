// ========================================
// Supabase Client — The Digital Grill
// ========================================

const SUPABASE_URL = 'https://busrtrucknqshpoxlhzz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1c3J0cnVja25xc2hwb3hsaHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzc2NTAsImV4cCI6MjA4ODk1MzY1MH0.75Ni8L-stt8Z0kq5lFHr7NL-G9wYWoHjHDlWhcwp0m4';

// Initialize client (loaded from CDN in index.html)
let supabaseClient = null;

function initSupabase() {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase connected');
    return true;
  }
  console.warn('⚠️ Supabase SDK not loaded, using local data');
  return false;
}

// ── Fetch Menu Items from Supabase ──
async function fetchMenuFromSupabase() {
  if (!supabaseClient) return null;

  try {
    const { data, error } = await supabaseClient
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .order('category', { ascending: true });

    if (error) {
      console.error('Error fetching menu:', error.message);
      return null;
    }

    if (data && data.length > 0) {
      console.log(`✅ Loaded ${data.length} menu items from Supabase`);
      return data;
    }

    console.log('⚠️ No menu items in Supabase, using local data');
    return null;
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return null;
  }
}

// ── Save Order to Supabase ──
async function saveOrderToSupabase(orderData) {
  if (!supabaseClient) {
    console.warn('Supabase not available, order saved locally only');
    return null;
  }

  try {
    // 1. Insert the order
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        order_type: orderData.orderType,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        service_fee: orderData.serviceFee,
        total: orderData.total,
        status: 'confirmed'
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error saving order:', orderError.message);
      return null;
    }

    // 2. Insert order items
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      menu_item_id: item.id,
      item_name: item.name,
      item_price: item.price,
      quantity: item.quantity,
      customizations: item.selectedCustomizations || [],
      line_total: (item.price + (item.selectedCustomizations || []).reduce((s, c) => s + c.price, 0)) * item.quantity
    }));

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error saving order items:', itemsError.message);
    }

    console.log(`✅ Order #${orderData.orderNumber} saved to Supabase (ID: ${order.id})`);
    return order;
  } catch (err) {
    console.error('Supabase save error:', err);
    return null;
  }
}

// ── Get Order History (for potential admin use) ──
async function getRecentOrders(limit = 20) {
  if (!supabaseClient) return [];

  try {
    const { data, error } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching orders:', error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Supabase fetch error:', err);
    return [];
  }
}
