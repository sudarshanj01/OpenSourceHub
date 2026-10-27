import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminPin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let profile = await prisma.restaurantProfile.findFirst();
    if (!profile) {
      profile = await prisma.restaurantProfile.create({
        data: {
          name: "Spice Route Kitchen",
          tagline: "Authentic Flavours, Modern Dining",
          currencySymbol: "₹",
          currencyCode: "INR",
          cgstPercentage: 2.5,
          sgstPercentage: 2.5,
          serviceChargePercentage: 0.0,
          fssaiLicense: "10019011006543",
          gstNumber: "07AAAAA1234A1Z5",
          address: "Shop 14-16, Inner Circle, Connaught Place, New Delhi",
          phone: "+91 98765 43210",
          email: "order@spiceroutekitchen.in",
          wifiSsid: "SpiceRoute_Guest",
          wifiPassword: "Namaste2026",
          openingHours: "Mon - Sun: 11:30 AM – 11:30 PM",
          tableCount: 20,
          adminPin: "1234",
          upiId: "spiceroute@upi",
        },
      });
    }

    // Never return the adminPin in plain GET
    const { adminPin, ...safeProfile } = profile;
    return NextResponse.json(safeProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const pin = request.headers.get('x-admin-pin');
    const isAuthorized = await verifyAdminPin(pin);
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Invalid Admin PIN' }, { status: 401 });
    }

    const body = await request.json();
    let profile = await prisma.restaurantProfile.findFirst();

    if (!profile) {
      profile = await prisma.restaurantProfile.create({ data: {} });
    }

    const updated = await prisma.restaurantProfile.update({
      where: { id: profile.id },
      data: {
        name: body.name ?? profile.name,
        tagline: body.tagline ?? profile.tagline,
        description: body.description ?? profile.description,
        currencySymbol: body.currencySymbol ?? profile.currencySymbol,
        currencyCode: body.currencyCode ?? profile.currencyCode,
        cgstPercentage: typeof body.cgstPercentage === 'number' ? body.cgstPercentage : profile.cgstPercentage,
        sgstPercentage: typeof body.sgstPercentage === 'number' ? body.sgstPercentage : profile.sgstPercentage,
        serviceChargePercentage: typeof body.serviceChargePercentage === 'number' ? body.serviceChargePercentage : profile.serviceChargePercentage,
        fssaiLicense: body.fssaiLicense ?? profile.fssaiLicense,
        gstNumber: body.gstNumber ?? profile.gstNumber,
        address: body.address ?? profile.address,
        phone: body.phone ?? profile.phone,
        email: body.email ?? profile.email,
        wifiSsid: body.wifiSsid ?? profile.wifiSsid,
        wifiPassword: body.wifiPassword ?? profile.wifiPassword,
        openingHours: body.openingHours ?? profile.openingHours,
        tableCount: typeof body.tableCount === 'number' ? body.tableCount : profile.tableCount,
        upiId: body.upiId ?? profile.upiId,
        adminPin: body.newAdminPin && body.newAdminPin.trim().length >= 4 ? body.newAdminPin.trim() : profile.adminPin,
        bannerUrl: body.bannerUrl ?? profile.bannerUrl,
        logoUrl: body.logoUrl ?? profile.logoUrl,
      },
    });

    const { adminPin: _, ...safeProfile } = updated;
    return NextResponse.json(safeProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
