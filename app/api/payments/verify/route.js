import { getServerUser } from '@/lib/serverAuth';
import crypto from 'crypto';
import { NextResponse } from 'next/server';

export async function POST(req) {
  const { user, error } = await getServerUser(req);
  if (error) return error;

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await req.json();
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body)
    .digest('hex');
  return NextResponse.json({ verified: expectedSignature === razorpaySignature });
}
