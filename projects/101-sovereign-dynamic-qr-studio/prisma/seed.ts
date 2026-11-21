import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding QRShield database with starter campaigns...");

  const existing = await prisma.campaign.count();
  if (existing > 0) {
    console.log("Database already has campaigns. Skipping seed.");
    return;
  }

  // 1. Summer Cafe Menu (Dynamic)
  const cafeMenu = await prisma.campaign.create({
    data: {
      slug: "summer-menu",
      title: "Artisan Cafe & Bakery — Summer Menu",
      description: "Printed on all 24 patio and dining tables. Destination updated weekly without reprinting.",
      destinationUrl: "https://example.com/menu/summer-artisan",
      type: "DYNAMIC",
      qrType: "URL",
      totalScans: 142,
      stylingConfig: JSON.stringify({
        dotType: "rounded",
        cornerSquareType: "extra-rounded",
        cornerDotType: "dot",
        dotsColor: "#0284c7",
        gradientEnabled: true,
        gradientType: "linear",
        gradientStart: "#0284c7",
        gradientEnd: "#06b6d4",
        gradientRotation: 45,
        bgColor: "#ffffff",
        frameText: "SCAN FOR MENU",
        frameColor: "#0284c7",
      }),
    },
  });

  // Seed some realistic scan events for analytics demo
  const browsers = ["Safari", "Chrome", "Firefox", "Edge"];
  const oss = ["iOS", "Android", "macOS", "Windows"];
  const devices = ["Mobile", "Mobile", "Mobile", "Tablet", "Desktop"];

  for (let i = 0; i < 28; i++) {
    const hoursAgo = Math.floor(Math.random() * 72);
    const date = new Date(Date.now() - hoursAgo * 3600 * 1000);
    await prisma.scan.create({
      data: {
        campaignId: cafeMenu.id,
        device: devices[Math.floor(Math.random() * devices.length)],
        os: oss[Math.floor(Math.random() * oss.length)],
        browser: browsers[Math.floor(Math.random() * browsers.length)],
        ipHash: `anon_${Math.random().toString(36).substring(2, 10)}`,
        referer: "Camera QR Scanner",
        scannedAt: date,
      },
    });
  }

  // 2. Guest High-Speed Wi-Fi (Static)
  await prisma.campaign.create({
    data: {
      slug: "guest-wifi-lobby",
      title: "HQ Guest Lounge Wi-Fi",
      description: "Instant Wi-Fi connect QR code for guests. Zero server required; works offline forever.",
      destinationUrl: "WIFI:S:Guest_HQ_Fiber;T:WPA;P:WelcomeGuest2026;;",
      type: "STATIC",
      qrType: "WIFI",
      totalScans: 59,
      stylingConfig: JSON.stringify({
        dotType: "classy-rounded",
        cornerSquareType: "extra-rounded",
        cornerDotType: "dot",
        dotsColor: "#10b981",
        gradientEnabled: true,
        gradientType: "linear",
        gradientStart: "#059669",
        gradientEnd: "#10b981",
        gradientRotation: 90,
        bgColor: "#ffffff",
        frameText: "CONNECT TO WI-FI",
        frameColor: "#059669",
      }),
    },
  });

  // 3. Founder Digital vCard (Static)
  await prisma.campaign.create({
    data: {
      slug: "elena-vcard",
      title: "Elena Vance — Managing Director Card",
      description: "Direct vCard QR printed on metal business cards. Saves full phone, email, and LinkedIn.",
      destinationUrl: "BEGIN:VCARD\nVERSION:3.0\nN:Vance;Elena;;;\nFN:Elena Vance\nORG:Sovereign Tech\nTITLE:Managing Director\nTEL;TYPE=CELL:+15550192834\nEMAIL:elena@sovereigntech.io\nURL:https://sovereigntech.io\nEND:VCARD",
      type: "STATIC",
      qrType: "VCARD",
      totalScans: 31,
      stylingConfig: JSON.stringify({
        dotType: "dots",
        cornerSquareType: "dot",
        cornerDotType: "dot",
        dotsColor: "#6366f1",
        gradientEnabled: true,
        gradientType: "linear",
        gradientStart: "#4f46e5",
        gradientEnd: "#a855f7",
        gradientRotation: 135,
        bgColor: "#ffffff",
        frameText: "SAVE CONTACT",
        frameColor: "#4f46e5",
      }),
    },
  });

  console.log("✅ Seed completed successfully with 3 initial campaigns and scan logs.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
