import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.companySettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.companySettings.create({
        data: {
          id: "default",
          companyName: "Craft & Foundry Studio",
          tagline: "Central Workshop & Retail Store",
          adminPin: process.env.ADMIN_PIN || "1234",
          timezone: "America/New_York",
          currency: "$",
          kioskResetSeconds: 4,
          allowBreakPunches: true,
          requirePin: true,
          soundEffects: true,
        },
      });
    }

    const departments = await prisma.department.findMany({
      orderBy: { name: "asc" },
    });

    const shiftPolicy = await prisma.shiftPolicy.findFirst({
      where: { isDefault: true },
    });

    // SECURITY: Never leak adminPin to frontend
    const { adminPin: _, ...safeSettings } = settings;

    return NextResponse.json({
      settings: safeSettings,
      departments,
      shiftPolicy,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      tagline,
      timezone,
      currency,
      kioskResetSeconds,
      allowBreakPunches,
      soundEffects,
      newAdminPin,
      shiftStartTime,
      shiftEndTime,
      shiftGraceMinutes,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (companyName !== undefined) updateData.companyName = companyName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (currency !== undefined) updateData.currency = currency;
    if (kioskResetSeconds !== undefined) updateData.kioskResetSeconds = Number(kioskResetSeconds);
    if (allowBreakPunches !== undefined) updateData.allowBreakPunches = Boolean(allowBreakPunches);
    if (soundEffects !== undefined) updateData.soundEffects = Boolean(soundEffects);
    if (newAdminPin && newAdminPin.trim().length >= 4) {
      updateData.adminPin = newAdminPin.trim();
    }

    const updatedSettings = await prisma.companySettings.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        companyName: companyName || "My Business",
        tagline: tagline || "Main Branch",
        adminPin: newAdminPin || "1234",
        timezone: timezone || "UTC",
        currency: currency || "$",
        ...updateData,
      },
    });

    // Update shift policy if provided
    if (shiftStartTime || shiftEndTime || shiftGraceMinutes !== undefined) {
      const defaultShift = await prisma.shiftPolicy.findFirst({
        where: { isDefault: true },
      });
      if (defaultShift) {
        await prisma.shiftPolicy.update({
          where: { id: defaultShift.id },
          data: {
            ...(shiftStartTime && { startTime: shiftStartTime }),
            ...(shiftEndTime && { endTime: shiftEndTime }),
            ...(shiftGraceMinutes !== undefined && { graceMinutes: Number(shiftGraceMinutes) }),
          },
        });
      }
    }

    const { adminPin: _, ...safeSettings } = updatedSettings;
    return NextResponse.json({ success: true, settings: safeSettings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
