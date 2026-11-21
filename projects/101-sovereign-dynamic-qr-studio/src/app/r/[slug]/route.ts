import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent } from "@/lib/user-agent";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const providedPasscode = searchParams.get("passcode");

    const campaign = await prisma.campaign.findUnique({
      where: { slug },
    });

    if (!campaign) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>QRShield — 404 Not Found</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { background: #060910; color: #f1f5f9; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #0f172a; border: 1px solid #1e293b; padding: 40px 30px; border-radius: 16px; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              h1 { font-size: 24px; color: #ef4444; margin-bottom: 8px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.5; }
              .badge { display: inline-block; background: #1e293b; padding: 4px 12px; border-radius: 999px; font-size: 12px; color: #cbd5e1; margin-top: 15px; font-mono; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>QR Code Not Found</h1>
              <p>The sovereign campaign or QR destination for <code>${slug}</code> does not exist on this server.</p>
              <span class="badge">Sovereign Protection Active</span>
            </div>
          </body>
        </html>`,
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Check if campaign is active
    if (!campaign.isActive) {
      return new NextResponse(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>QRShield — Campaign Inactive</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { background: #060910; color: #f1f5f9; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; text-align: center; }
              .card { background: #0f172a; border: 1px solid #1e293b; padding: 40px 30px; border-radius: 16px; max-width: 440px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
              h1 { font-size: 24px; color: #f59e0b; margin-bottom: 8px; }
              p { color: #94a3b8; font-size: 15px; line-height: 1.5; }
              .badge { display: inline-block; background: #1e293b; padding: 4px 12px; border-radius: 999px; font-size: 12px; color: #cbd5e1; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Campaign Paused</h1>
              <p>The destination for <strong>${campaign.title}</strong> is currently paused or inactive by the administrator.</p>
              <span class="badge">Sovereign QRShield Host</span>
            </div>
          </body>
        </html>`,
        { status: 403, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Check password protection
    if (campaign.passcode && campaign.passcode.trim().length > 0) {
      if (providedPasscode !== campaign.passcode) {
        // Redirect to unlock page
        const unlockUrl = new URL(`/r/${slug}/unlock`, request.url);
        return NextResponse.redirect(unlockUrl, 307);
      }
    }

    // Asynchronously log scan
    const userAgent = request.headers.get("user-agent");
    const referer = request.headers.get("referer");
    const clientInfo = parseUserAgent(userAgent);

    // Simple IP hash for privacy
    const rawIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    let hash = 0;
    for (let i = 0; i < rawIp.length; i++) {
      hash = (hash << 5) - hash + rawIp.charCodeAt(i);
      hash |= 0;
    }
    const ipHash = `anon_${Math.abs(hash).toString(16)}`;

    // Update scan count and create scan event asynchronously
    Promise.all([
      prisma.campaign.update({
        where: { id: campaign.id },
        data: { totalScans: { increment: 1 } },
      }),
      prisma.scan.create({
        data: {
          campaignId: campaign.id,
          device: clientInfo.device,
          os: clientInfo.os,
          browser: clientInfo.browser,
          ipHash,
          referer: referer || "Camera Direct Scan",
        },
      }),
    ]).catch((err) => console.error("Async scan logging error:", err));

    // Redirect to destination
    return NextResponse.redirect(campaign.destinationUrl, 307);
  } catch (error) {
    console.error("Redirect error:", error);
    return new NextResponse("Server Redirect Error", { status: 500 });
  }
}
