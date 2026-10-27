import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { attendanceId, employeeId, date, clockIn, clockOut, status, notes } = await request.json();

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    let updated;
    if (attendanceId) {
      updated = await prisma.attendance.update({
        where: { id: attendanceId },
        data: {
          ...(clockIn && { clockIn: new Date(clockIn) }),
          ...(clockOut && { clockOut: new Date(clockOut) }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
      });
    } else if (employeeId) {
      updated = await prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId,
            date: targetDate,
          },
        },
        update: {
          ...(clockIn && { clockIn: new Date(clockIn) }),
          ...(clockOut && { clockOut: new Date(clockOut) }),
          ...(status && { status }),
          ...(notes !== undefined && { notes }),
        },
        create: {
          employeeId,
          date: targetDate,
          status: status || "PRESENT",
          clockIn: clockIn ? new Date(clockIn) : new Date(),
          clockOut: clockOut ? new Date(clockOut) : null,
          notes,
        },
      });
    } else {
      return NextResponse.json({ error: "attendanceId or employeeId required" }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        action: "MANUAL_PUNCH_EDIT",
        details: `Manual attendance update for attendance ID ${updated.id}`,
      },
    });

    return NextResponse.json({ success: true, attendance: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
