import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    const profile = await prisma.restaurantProfile.findFirst();

    const expectedPin = profile?.adminPin || process.env.ADMIN_PIN || '1234';

    if (pin && pin.trim() === expectedPin.trim()) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
  } catch (error) {
    console.error('PIN verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
