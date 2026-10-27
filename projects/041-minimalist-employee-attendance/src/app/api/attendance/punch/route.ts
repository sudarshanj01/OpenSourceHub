import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { employeeId, pin, action, notes } = await request.json();

    if (!employeeId || !action) {
      return NextResponse.json(
        { error: "Employee ID and punch action are required" },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        shiftPolicy: true,
      },
    });

    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: "Employee not found or inactive" }, { status: 404 });
    }

    // Verify PIN
    if (employee.pin !== pin?.trim()) {
      return NextResponse.json({ error: "Incorrect 4-digit PIN" }, { status: 401 });
    }

    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    // Get or create today's Attendance
    let attendance = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: employee.id,
          date: today,
        },
      },
      include: {
        punches: {
          orderBy: { timestamp: "asc" },
        },
      },
    });

    if (!attendance) {
      attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          date: today,
          status: "PRESENT",
        },
        include: {
          punches: true,
        },
      });
    }

    // Determine shift policy
    const shift =
      employee.shiftPolicy ||
      (await prisma.shiftPolicy.findFirst({ where: { isDefault: true } })) || {
        startTime: "09:00",
        endTime: "17:00",
        graceMinutes: 15,
        halfDayHours: 4.0,
        fullDayHours: 8.0,
      };

    let responseMessage = "";
    let statusLabel = "";

    if (action === "CLOCK_IN") {
      // Check if already clocked in today
      const alreadyClockedIn = attendance.clockIn !== null;

      // Calculate if late
      const [startHour, startMin] = shift.startTime.split(":").map(Number);
      const shiftStartDate = new Date(now);
      shiftStartDate.setHours(startHour, startMin, 0, 0);

      const graceDate = new Date(shiftStartDate.getTime() + shift.graceMinutes * 60 * 1000);
      const isLate = now > graceDate;
      const lateMinutes = isLate ? Math.max(0, Math.floor((now.getTime() - shiftStartDate.getTime()) / 60000)) : 0;

      const updated = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          clockIn: alreadyClockedIn ? attendance.clockIn : now,
          status: isLate ? "LATE" : "PRESENT",
          isLate,
          lateMinutes,
        },
      });

      await prisma.punch.create({
        data: {
          attendanceId: attendance.id,
          type: "CLOCK_IN",
          timestamp: now,
          notes: notes || (isLate ? `Late by ${lateMinutes}m` : "On time punch"),
        },
      });

      statusLabel = isLate ? `Late by ${lateMinutes}m` : "On Time";
      responseMessage = isLate
        ? `Clocked In! Note: Logged as late (${lateMinutes} mins past shift start).`
        : `Clocked In! Welcome to your shift, ${employee.name.split(" ")[0]}.`;
    } else if (action === "BREAK_START") {
      await prisma.punch.create({
        data: {
          attendanceId: attendance.id,
          type: "BREAK_START",
          timestamp: now,
          notes: notes || "Started break",
        },
      });

      statusLabel = "On Break";
      responseMessage = `Enjoy your break, ${employee.name.split(" ")[0]}!`;
    } else if (action === "BREAK_END") {
      // Calculate break duration from last BREAK_START
      const punches = await prisma.punch.findMany({
        where: { attendanceId: attendance.id },
        orderBy: { timestamp: "desc" },
      });

      const lastBreakStart = punches.find((p) => p.type === "BREAK_START");
      let breakDurationMinutes = 0;
      if (lastBreakStart) {
        breakDurationMinutes = Math.max(
          1,
          Math.floor((now.getTime() - new Date(lastBreakStart.timestamp).getTime()) / 60000)
        );
      }

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          totalBreakMinutes: {
            increment: breakDurationMinutes,
          },
        },
      });

      await prisma.punch.create({
        data: {
          attendanceId: attendance.id,
          type: "BREAK_END",
          timestamp: now,
          notes: notes || `Ended break (${breakDurationMinutes} mins)`,
        },
      });

      statusLabel = "Resumed Shift";
      responseMessage = `Welcome back from break, ${employee.name.split(" ")[0]}!`;
    } else if (action === "CLOCK_OUT") {
      // Calculate total work minutes
      const clockInTime = attendance.clockIn || now;
      const totalElapsedMinutes = Math.max(
        0,
        Math.floor((now.getTime() - new Date(clockInTime).getTime()) / 60000)
      );

      const netWorkMinutes = Math.max(0, totalElapsedMinutes - attendance.totalBreakMinutes);
      const fullDayMinutes = shift.fullDayHours * 60;
      const halfDayMinutes = shift.halfDayHours * 60;

      let finalStatus = attendance.status;
      if (netWorkMinutes < halfDayMinutes) {
        finalStatus = "HALF_DAY";
      }

      const isOvertime = netWorkMinutes > fullDayMinutes;
      const overtimeMinutes = isOvertime ? netWorkMinutes - fullDayMinutes : 0;

      await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          clockOut: now,
          totalWorkMinutes: netWorkMinutes,
          status: finalStatus,
          isOvertime,
          overtimeMinutes,
        },
      });

      await prisma.punch.create({
        data: {
          attendanceId: attendance.id,
          type: "CLOCK_OUT",
          timestamp: now,
          notes: notes || `Clocked out. Net work: ${Math.floor(netWorkMinutes / 60)}h ${netWorkMinutes % 60}m`,
        },
      });

      const hrs = Math.floor(netWorkMinutes / 60);
      const mins = netWorkMinutes % 60;
      statusLabel = `Worked ${hrs}h ${mins}m`;
      responseMessage = `Great work today, ${employee.name.split(" ")[0]}! Clocked out successfully.`;
    }

    const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    return NextResponse.json({
      success: true,
      action,
      employeeName: employee.name,
      time: timeFormatted,
      statusLabel,
      message: responseMessage,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
