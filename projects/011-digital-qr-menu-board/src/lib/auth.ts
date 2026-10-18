import { prisma } from './prisma';

export async function verifyAdminPin(pinHeader: string | null): Promise<boolean> {
  if (!pinHeader) return false;
  const profile = await prisma.restaurantProfile.findFirst();
  const expectedPin = profile?.adminPin || process.env.ADMIN_PIN || '1234';
  return pinHeader.trim() === expectedPin.trim();
}
