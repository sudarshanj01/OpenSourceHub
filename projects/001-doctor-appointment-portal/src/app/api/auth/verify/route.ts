import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 });
    }

    const profile = await prisma.doctorProfile.findFirst();
    const storedPin = profile?.adminPin || process.env.ADMIN_PIN || '1234';

    if (pin.trim() === storedPin.trim()) {
      return NextResponse.json({ success: true, authenticated: true });
    } else {
      return NextResponse.json({ success: false, error: 'Incorrect PIN' }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
