import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();
    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const settings = await prisma.companySettings.findUnique({
      where: { id: "default" },
    });

    const expectedPin = settings?.adminPin || process.env.ADMIN_PIN || "1234";

    if (pin.trim() === expectedPin.trim()) {
      return NextResponse.json({ success: true, message: "Authorized" });
    } else {
      return NextResponse.json({ error: "Invalid management PIN" }, { status: 401 });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
