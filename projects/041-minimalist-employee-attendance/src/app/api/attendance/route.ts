import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");

    const targetDate = dateParam ? new Date(dateParam) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        date: targetDate,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            name: true,
            role: true,
            department: true,
            avatarColor: true,
            hourlyWage: true,
          },
        },
        punches: {
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: {
        clockIn: "desc",
      },
    });

    return NextResponse.json({ attendances });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
