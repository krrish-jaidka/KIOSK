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
    // Build full payload (includes new columns that require ALTER TABLE migration)
    const fullPayload = {
      order_number: orderData.orderNumber,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      order_type: orderData.orderType,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      service_fee: orderData.serviceFee,
      total: orderData.total,
      status: 'confirmed',
      // New columns (need ALTER TABLE migration)
      payment_method: orderData.paymentMethod || 'cash',
      payment_details: orderData.paymentDetails,
      discount_code: orderData.discountCode,
      discount_amount: orderData.discountAmount
    };

    // Core-only payload — ONLY columns confirmed to exist in the DB
    const corePayload = {
      order_number: orderData.orderNumber,
      customer_name: orderData.customerName,
      customer_phone: orderData.customerPhone,
      order_type: orderData.orderType,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      service_fee: orderData.serviceFee,
      total: orderData.total,
      status: 'confirmed'
    };

    // 1. Try inserting with all fields first
    let { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert(fullPayload)
      .select()
      .single();

    // If it failed because of missing columns, retry with core fields only
    if (orderError && orderError.message && orderError.message.includes('column')) {
      console.warn('⚠️ Some columns missing in DB, saving with core fields only. Run the ALTER TABLE migration for full data.');
      const retryResult = await supabaseClient
        .from('orders')
        .insert(corePayload)
        .select()
        .single();
      order = retryResult.data;
      orderError = retryResult.error;
    }

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
      note: item.note || '',
      line_total: (item.price + (item.selectedCustomizations || []).reduce((s, c) => s + c.price, 0)) * item.quantity
    }));

    let { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems);

    // If 'note' column missing, retry without it
    if (itemsError && itemsError.message && itemsError.message.includes('column')) {
      console.warn('⚠️ order_items column mismatch, retrying with core fields only.');
      const coreItems = orderData.items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        item_name: item.name,
        item_price: item.price,
        quantity: item.quantity,
        customizations: item.selectedCustomizations || [],
        line_total: (item.price + (item.selectedCustomizations || []).reduce((s, c) => s + c.price, 0)) * item.quantity
      }));
      const retryItems = await supabaseClient.from('order_items').insert(coreItems);
      itemsError = retryItems.error;
    }

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
