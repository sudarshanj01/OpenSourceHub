import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // optional filter

    const where: any = {};
    if (type && type !== "ALL") {
      where.type = type;
    }

    const campaigns = await prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { scans: true },
        },
      },
    });

    return NextResponse.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("Failed to fetch campaigns:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      destinationUrl,
      type = "DYNAMIC",
      qrType = "URL",
      slug,
      passcode,
      stylingConfig = "{}",
    } = body;

    if (!title || !destinationUrl) {
      return NextResponse.json(
        { success: false, error: "Title and Destination URL are required." },
        { status: 400 }
      );
    }

    // Generate clean slug if not provided
    const cleanSlug =
      slug?.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-") ||
      `qr-${Math.random().toString(36).substring(2, 8)}`;

    // Verify slug uniqueness
    const existing = await prisma.campaign.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Slug '${cleanSlug}' is already in use. Please choose another one.` },
        { status: 409 }
      );
    }

    const campaign = await prisma.campaign.create({
      data: {
        slug: cleanSlug,
        title,
        description,
        destinationUrl,
        type,
        qrType,
        passcode: passcode?.trim() || null,
        stylingConfig: typeof stylingConfig === "string" ? stylingConfig : JSON.stringify(stylingConfig),
      },
    });

    return NextResponse.json({ success: true, campaign }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create campaign:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create campaign" },
      { status: 500 }
    );
  }
}
