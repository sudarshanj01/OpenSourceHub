import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("departmentId");
    const activeOnly = searchParams.get("activeOnly") !== "false";

    // Truncate to today UTC
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const whereClause: Record<string, unknown> = {};
    if (activeOnly) whereClause.isActive = true;
    if (departmentId && departmentId !== "all") whereClause.departmentId = departmentId;

    const employees = await prisma.employee.findMany({
      where: whereClause,
      include: {
        department: true,
        shiftPolicy: true,
        attendances: {
          where: {
            date: today,
          },
          include: {
            punches: {
              orderBy: { timestamp: "asc" },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // SECURITY: Strip out raw PIN before returning to browser
    const sanitizedEmployees = employees.map((emp) => {
      const todayAttendance = emp.attendances[0] || null;
      const latestPunch = todayAttendance?.punches?.length
        ? todayAttendance.punches[todayAttendance.punches.length - 1]
        : null;

      // Determine current live punch status:
      // NOT_CLOCKED_IN, CLOCKED_IN, ON_BREAK, CLOCKED_OUT
      let currentStatus = "NOT_CLOCKED_IN";
      if (todayAttendance?.clockOut) {
        currentStatus = "CLOCKED_OUT";
      } else if (latestPunch) {
        if (latestPunch.type === "CLOCK_IN" || latestPunch.type === "BREAK_END") {
          currentStatus = "CLOCKED_IN";
        } else if (latestPunch.type === "BREAK_START") {
          currentStatus = "ON_BREAK";
        } else if (latestPunch.type === "CLOCK_OUT") {
          currentStatus = "CLOCKED_OUT";
        }
      }

      const { pin: _, attendances: __, ...safeData } = emp;

      return {
        ...safeData,
        currentStatus,
        todayAttendance,
        latestPunch,
      };
    });

    return NextResponse.json({ employees: sanitizedEmployees });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      employeeCode,
      name,
      role,
      departmentId,
      pin,
      hourlyWage,
      email,
      phone,
      avatarColor,
      shiftPolicyId,
    } = body;

    if (!employeeCode || !name || !role) {
      return NextResponse.json(
        { error: "Employee code, name, and role are required" },
        { status: 400 }
      );
    }

    const cleanPin = pin ? pin.trim() : "1234";

    // Random avatar colors if not specified
    const colors = [
      "bg-emerald-600",
      "bg-blue-600",
      "bg-amber-600",
      "bg-purple-600",
      "bg-rose-600",
      "bg-indigo-600",
      "bg-teal-600",
    ];
    const chosenColor = avatarColor || colors[Math.floor(Math.random() * colors.length)];

    const newEmployee = await prisma.employee.create({
      data: {
        employeeCode: employeeCode.trim().toUpperCase(),
        name: name.trim(),
        role: role.trim(),
        departmentId: departmentId || null,
        pin: cleanPin,
        hourlyWage: hourlyWage ? parseFloat(hourlyWage) : 20.0,
        email: email ? email.trim() : null,
        phone: phone ? phone.trim() : null,
        avatarColor: chosenColor,
        shiftPolicyId: shiftPolicyId || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "EMPLOYEE_CREATED",
        details: `Created employee ${newEmployee.name} (${newEmployee.employeeCode})`,
      },
    });

    const { pin: _, ...safeEmployee } = newEmployee;
    return NextResponse.json({ success: true, employee: safeEmployee }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
