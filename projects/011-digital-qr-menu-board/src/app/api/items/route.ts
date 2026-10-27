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
      nameHindi,
      description,
      price,
      halfPrice,
      isAvailable = true,
      foodType = 'veg',
      isJainAvailable = false,
      spiceLevel = 1,
      cuisineType = 'north-indian',
      isChefSpecial = false,
      isBestseller = false,
      isTodaySpecial = false,
      isNewItem = false,
      calories,
      prepTimeMinutes,
      servesCount,
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
        nameHindi: nameHindi ? nameHindi.trim() : null,
        description: (description || '').trim(),
        price: parseFloat(price),
        halfPrice: halfPrice !== undefined && halfPrice !== null && halfPrice !== '' ? parseFloat(halfPrice) : null,
        isAvailable: Boolean(isAvailable),
        foodType: ['veg', 'nonveg', 'egg'].includes(foodType) ? foodType : 'veg',
        isJainAvailable: Boolean(isJainAvailable),
        spiceLevel: typeof spiceLevel === 'number' ? spiceLevel : parseInt(spiceLevel || '1', 10),
        cuisineType: cuisineType || 'north-indian',
        isChefSpecial: Boolean(isChefSpecial),
        isBestseller: Boolean(isBestseller),
        isTodaySpecial: Boolean(isTodaySpecial),
        isNewItem: Boolean(isNewItem),
        calories: calories ? parseInt(calories, 10) : null,
        prepTimeMinutes: prepTimeMinutes ? parseInt(prepTimeMinutes, 10) : null,
        servesCount: servesCount ? servesCount.trim() : null,
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
