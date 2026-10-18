import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPin } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const isAuthorized = await verifyAdminPin(pin);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.isAvailable !== undefined) updateData.isAvailable = Boolean(body.isAvailable);
    if (body.isVegetarian !== undefined) updateData.isVegetarian = Boolean(body.isVegetarian);
    if (body.isVegan !== undefined) updateData.isVegan = Boolean(body.isVegan);
    if (body.isGlutenFree !== undefined) updateData.isGlutenFree = Boolean(body.isGlutenFree);
    if (body.isSpicy !== undefined) updateData.isSpicy = Boolean(body.isSpicy);
    if (body.isChefSpecial !== undefined) updateData.isChefSpecial = Boolean(body.isChefSpecial);
    if (body.calories !== undefined) updateData.calories = body.calories ? parseInt(body.calories, 10) : null;
    if (body.prepTimeMinutes !== undefined) updateData.prepTimeMinutes = body.prepTimeMinutes ? parseInt(body.prepTimeMinutes, 10) : null;
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
  { params }: { params: { id: string } }
) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const isAuthorized = await verifyAdminPin(pin);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ error: 'Failed to delete menu item' }, { status: 500 });
  }
}
