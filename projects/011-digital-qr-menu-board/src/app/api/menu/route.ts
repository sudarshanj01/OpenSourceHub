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
        name: "The Rustic Skillet Bistro",
        tagline: "Artisanal Comfort Food & Craft Sips",
        currencySymbol: "$",
        currencyCode: "USD",
        taxPercentage: 8.5,
        serviceChargePercentage: 0.0,
        wifiSsid: "RusticSkillet_Guest",
        wifiPassword: "FreshFood2026",
        tableCount: 16,
      },
      categories,
    });
  } catch (error) {
    console.error('Failed to fetch menu:', error);
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}
