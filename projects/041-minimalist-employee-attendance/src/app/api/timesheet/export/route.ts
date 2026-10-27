import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const departmentId = searchParams.get("departmentId");

    const now = new Date();
    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const employeeWhere: Record<string, unknown> = { isActive: true };
    if (departmentId && departmentId !== "all") {
      employeeWhere.departmentId = departmentId;
    }

    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      include: {
        department: true,
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          orderBy: { date: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const rows = [
      [
        "Employee Code",
        "Full Name",
        "Department",
        "Role",
        "Hourly Wage ($)",
        "Days Worked",
        "Total Hours",
        "Regular Hours",
        "Overtime Hours",
        "Late Incidents",
        "Total Late Mins",
        "Estimated Gross Pay ($)",
      ],
    ];

    for (const emp of employees) {
      let daysPresent = 0;
      let daysLate = 0;
      let totalWorkMins = 0;
      let totalOvertimeMins = 0;
      let totalLateMins = 0;

      for (const att of emp.attendances) {
        if (att.status !== "ABSENT") daysPresent++;
        if (att.isLate) {
          daysLate++;
          totalLateMins += att.lateMinutes;
        }
        totalWorkMins += att.totalWorkMinutes;
        totalOvertimeMins += att.overtimeMinutes;
      }

      const totalHours = (totalWorkMins / 60).toFixed(2);
      const regularHours = (Math.max(0, totalWorkMins - totalOvertimeMins) / 60).toFixed(2);
      const overtimeHours = (totalOvertimeMins / 60).toFixed(2);
      const wage = emp.hourlyWage || 0;
      const regularPay = parseFloat(regularHours) * wage;
      const overtimePay = parseFloat(overtimeHours) * (wage * 1.5);
      const totalPay = (regularPay + overtimePay).toFixed(2);

      rows.push([
        `"${emp.employeeCode}"`,
        `"${emp.name}"`,
        `"${emp.department?.name || "General"}"`,
        `"${emp.role}"`,
        `"${wage.toFixed(2)}"`,
        `"${daysPresent}"`,
        `"${totalHours}"`,
        `"${regularHours}"`,
        `"${overtimeHours}"`,
        `"${daysLate}"`,
        `"${totalLateMins}"`,
        `"${totalPay}"`,
      ]);
    }

    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const filename = `timesheet-${startDate.toISOString().split("T")[0]}-to-${endDate.toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
