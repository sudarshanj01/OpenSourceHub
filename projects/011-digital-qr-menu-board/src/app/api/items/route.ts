import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPin } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const isAuthorized = await verifyAdminPin(pin);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      categoryId,
      name,
      description,
      price,
      isAvailable = true,
      isVegetarian = false,
      isVegan = false,
      isGlutenFree = false,
      isSpicy = false,
      isChefSpecial = false,
      calories,
      prepTimeMinutes,
      badge,
      imageUrl,
    } = body;

    if (!categoryId || !name || price === undefined) {
      return NextResponse.json({ error: 'Missing required fields: categoryId, name, price' }, { status: 400 });
    }

    // Get max sort order
    const lastItem = await prisma.menuItem.findFirst({
      where: { categoryId },
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = (lastItem?.sortOrder ?? -1) + 1;

    const item = await prisma.menuItem.create({
      data: {
        categoryId,
        name: name.trim(),
        description: (description || '').trim(),
        price: parseFloat(price),
        isAvailable: Boolean(isAvailable),
        isVegetarian: Boolean(isVegetarian),
        isVegan: Boolean(isVegan),
        isGlutenFree: Boolean(isGlutenFree),
        isSpicy: Boolean(isSpicy),
        isChefSpecial: Boolean(isChefSpecial),
        calories: calories ? parseInt(calories, 10) : null,
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : null,
        badge: badge ? badge.trim() : null,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        sortOrder,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ error: 'Failed to create menu item' }, { status: 500 });
  }
}
