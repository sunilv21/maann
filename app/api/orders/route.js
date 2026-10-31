import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { getProductPrice } from '@/lib/productPricing';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data: orders } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!orders?.length) return NextResponse.json([]);

  const orderIds = orders.map(o => o.id);
  const { data: allItems } = await supabaseAdmin.from('order_items').select('*').in('order_id', orderIds);
  const { data: allReturns } = await supabaseAdmin.from('return_requests').select('*').in('order_id', orderIds);

  const itemsByOrder = {};
  const returnsByOrder = {};
  (allItems || []).forEach(i => { if (!itemsByOrder[i.order_id]) itemsByOrder[i.order_id] = []; itemsByOrder[i.order_id].push(i); });
  (allReturns || []).forEach(r => { if (!returnsByOrder[r.order_id]) returnsByOrder[r.order_id] = []; returnsByOrder[r.order_id].push(r); });

  return NextResponse.json(orders.map(o => ({ ...o, order_items: itemsByOrder[o.id] || [], return_requests: returnsByOrder[o.id] || [] })));
}

export async function POST(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { addressId, paymentMethod, paymentId, razorpayOrderId } = await req.json();

  const { data: cartItems } = await supabaseAdmin
    .from('cart_items')
    .select('*')
    .eq('user_id', user.id);

  if (!cartItems?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

  const productIds = cartItems.map(i => i.product_id);
  const { data: products } = await supabaseAdmin.from('products').select('*').in('id', productIds);
  const productsById = {};
  (products || []).forEach(p => { productsById[p.id] = p; });
  const cartWithProducts = cartItems.map(i => ({ ...i, products: productsById[i.product_id] || null }));
  const validCart = cartWithProducts.filter(i => i.products);
  if (!validCart.length) return NextResponse.json({ error: 'Cart items not found' }, { status: 400 });

  const { data: address } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single();

  if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 400 });

  const subtotal = validCart.reduce((s, i) => s + getProductPrice(i.products) * i.qty, 0);
  let shipping = subtotal >= 1500 ? 0 : 99;
  if (paymentMethod === 'cod') shipping += 50;
  const total = subtotal + shipping;

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert({
      user_id: user.id,
      address_snapshot: address,
      payment_method: paymentMethod,
      payment_id: paymentId || null,
      razorpay_order_id: razorpayOrderId || null,
      status: 'confirmed',
      total,
      shipping
    })
    .select()
    .single();

  console.log('[orders/POST] order insert:', { id: order?.id, error: orderError?.message });
  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  await supabaseAdmin.from('order_items').insert(
    validCart.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.products.name,
      price: getProductPrice(i.products),
      qty: i.qty,
      variant: i.variant
    }))
  );

  await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);

  const orderItems = validCart.map(i => ({
    product_name: i.products.name,
    price: getProductPrice(i.products),
    qty: i.qty,
    variant: i.variant,
  }));

  return NextResponse.json({ order: { ...order, order_items: orderItems } });
}
