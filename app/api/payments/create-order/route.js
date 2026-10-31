import { getServerUser } from '@/lib/serverAuth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getProductPrice } from '@/lib/productPricing';
import { razorpay } from '@/lib/razorpay';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { paymentMethod } = await req.json();
  const { data: cartItems, error: cartError } = await supabaseAdmin
    .from('cart_items')
    .select('qty, products(price, sale_price)')
    .eq('user_id', user.id);
  if (cartError) return NextResponse.json({ error: cartError.message }, { status: 500 });
  if (!cartItems?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });

  const subtotal = cartItems.reduce((sum, item) => sum + getProductPrice(item.products) * item.qty, 0);
  const shipping = subtotal > 0 && subtotal < 1500 ? 99 : 0;
  const amount = subtotal + shipping + (paymentMethod === 'cod' ? 50 : 0);
  try {
    const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR' });
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
  } catch {
    return NextResponse.json({ error: 'Payment gateway unavailable' }, { status: 500 });
  }
}
