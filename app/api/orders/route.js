import { supabaseAdmin } from '@/lib/supabase/admin';
import { getServerUser } from '@/lib/serverAuth';
import { getProductPrice } from '@/lib/productPricing';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { data } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*), return_requests(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json(data || []);
}

export async function POST(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { addressId, paymentMethod, paymentId, razorpayOrderId } = await req.json();

  const { data: cartItems } = await supabaseAdmin
    .from('cart_items')
    .select('*, products(*)')
    .eq('user_id', user.id);

  if (!cartItems?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

  const { data: address } = await supabaseAdmin
    .from('addresses')
    .select('*')
    .eq('id', addressId)
    .eq('user_id', user.id)
    .single();

  if (!address) return NextResponse.json({ error: 'Address not found' }, { status: 400 });

  const subtotal = cartItems.reduce((s, i) => s + getProductPrice(i.products) * i.qty, 0);
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

  if (orderError) return NextResponse.json({ error: orderError.message }, { status: 500 });

  await supabaseAdmin.from('order_items').insert(
    cartItems.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.products.name,
      price: getProductPrice(i.products),
      qty: i.qty,
      variant: i.variant
    }))
  );

  await supabaseAdmin.from('cart_items').delete().eq('user_id', user.id);

  return NextResponse.json(order);
}
