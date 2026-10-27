import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = await prisma.restaurantProfile.findFirst();

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        items: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
    });

    return NextResponse.json({
      profile: profile || {
        name: "Spice Route Kitchen",
        tagline: "Authentic Flavours, Modern Dining",
        currencySymbol: "₹",
        currencyCode: "INR",
        cgstPercentage: 2.5,
        sgstPercentage: 2.5,
        serviceChargePercentage: 0.0,
        fssaiLicense: "10019011006543",
        gstNumber: "07AAAAA1234A1Z5",
        wifiSsid: "SpiceRoute_Guest",
        wifiPassword: "Namaste2026",
        tableCount: 20,
        upiId: "spiceroute@upi",
      },
      categories,
    });
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}
