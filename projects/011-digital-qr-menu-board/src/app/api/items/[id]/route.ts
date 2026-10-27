import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const isAuthorized = await verifyAdminPin(pin);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.nameHindi !== undefined) updateData.nameHindi = body.nameHindi ? body.nameHindi.trim() : null;
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.halfPrice !== undefined) {
      updateData.halfPrice = body.halfPrice !== null && body.halfPrice !== '' ? parseFloat(body.halfPrice) : null;
    }
    if (body.isAvailable !== undefined) updateData.isAvailable = Boolean(body.isAvailable);
    if (body.foodType !== undefined) updateData.foodType = body.foodType;
    if (body.isJainAvailable !== undefined) updateData.isJainAvailable = Boolean(body.isJainAvailable);
    if (body.spiceLevel !== undefined) updateData.spiceLevel = parseInt(body.spiceLevel, 10);
    if (body.cuisineType !== undefined) updateData.cuisineType = body.cuisineType;
    if (body.isChefSpecial !== undefined) updateData.isChefSpecial = Boolean(body.isChefSpecial);
    if (body.isBestseller !== undefined) updateData.isBestseller = Boolean(body.isBestseller);
    if (body.isTodaySpecial !== undefined) updateData.isTodaySpecial = Boolean(body.isTodaySpecial);
    if (body.isNewItem !== undefined) updateData.isNewItem = Boolean(body.isNewItem);
    if (body.calories !== undefined) updateData.calories = body.calories ? parseInt(body.calories, 10) : null;
    if (body.prepTimeMinutes !== undefined) updateData.prepTimeMinutes = body.prepTimeMinutes ? parseInt(body.prepTimeMinutes, 10) : null;
    if (body.servesCount !== undefined) updateData.servesCount = body.servesCount ? body.servesCount.trim() : null;
    if (body.badge !== undefined) updateData.badge = body.badge ? body.badge.trim() : null;
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl ? body.imageUrl.trim() : null;
    if (body.categoryId !== undefined) updateData.categoryId = body.categoryId;
    if (body.sortOrder !== undefined) updateData.sortOrder = parseInt(body.sortOrder, 10);

    const updated = await prisma.menuItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ error: 'Failed to update menu item' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const isAuthorized = await verifyAdminPin(pin);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
