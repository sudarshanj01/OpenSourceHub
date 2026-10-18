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
    const { name, description, icon } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const lastCategory = await prisma.category.findFirst({
      orderBy: { sortOrder: 'desc' },
    });
    const sortOrder = (lastCategory?.sortOrder ?? -1) + 1;

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        icon: icon ? icon.trim() : null,
        sortOrder,
        isActive: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
