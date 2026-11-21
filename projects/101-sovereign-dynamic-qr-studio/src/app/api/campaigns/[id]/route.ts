import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        scans: {
          orderBy: { scannedAt: "desc" },
          take: 50,
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Aggregate statistics
    const scans = await prisma.scan.findMany({
      where: { campaignId: id },
      select: { device: true, os: true, browser: true, scannedAt: true },
    });

    const devices: Record<string, number> = {};
    const oss: Record<string, number> = {};
    const browsers: Record<string, number> = {};

    scans.forEach((s) => {
      const dev = s.device || "Unknown";
      const os = s.os || "Unknown";
      const br = s.browser || "Unknown";
      devices[dev] = (devices[dev] || 0) + 1;
      oss[os] = (oss[os] || 0) + 1;
      browsers[br] = (browsers[br] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      campaign,
      analytics: {
        totalScans: campaign.totalScans,
        devices,
        oss,
        browsers,
      },
    });
  } catch (error: any) {
    console.error("Error fetching campaign details:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaign details" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      "title",
      "description",
      "destinationUrl",
      "isActive",
      "passcode",
      "stylingConfig",
    ];

    const dataToUpdate: any = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        if (key === "stylingConfig" && typeof body[key] !== "string") {
          dataToUpdate[key] = JSON.stringify(body[key]);
        } else {
          dataToUpdate[key] = body[key];
        }
      }
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.campaign.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Campaign deleted" });
  } catch (error: any) {
    console.error("Error deleting campaign:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
