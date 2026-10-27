import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const departmentId = searchParams.get("departmentId");

    const now = new Date();
    // Default to current month from 1st to today
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

    let totalGrossEstimatedPay = 0;
    let totalWorkHoursAll = 0;
    let totalOvertimeHoursAll = 0;
    let totalLateIncidentsAll = 0;

    const employeeReports = employees.map((emp) => {
      let daysPresent = 0;
      let daysLate = 0;
      let totalWorkMins = 0;
      let totalOvertimeMins = 0;
      let totalLateMins = 0;

      for (const att of emp.attendances) {
        if (att.status !== "ABSENT") {
          daysPresent++;
        }
        if (att.isLate) {
          daysLate++;
          totalLateMins += att.lateMinutes;
        }
        totalWorkMins += att.totalWorkMinutes;
        totalOvertimeMins += att.overtimeMinutes;
      }

      const totalHours = parseFloat((totalWorkMins / 60).toFixed(2));
      const regularHours = parseFloat((Math.max(0, totalWorkMins - totalOvertimeMins) / 60).toFixed(2));
      const overtimeHours = parseFloat((totalOvertimeMins / 60).toFixed(2));
      const wage = emp.hourlyWage || 0;
      // Overtime 1.5x standard rate
      const regularPay = regularHours * wage;
      const overtimePay = overtimeHours * (wage * 1.5);
      const estimatedTotalPay = parseFloat((regularPay + overtimePay).toFixed(2));

      totalGrossEstimatedPay += estimatedTotalPay;
      totalWorkHoursAll += totalHours;
      totalOvertimeHoursAll += overtimeHours;
      totalLateIncidentsAll += daysLate;

      return {
        id: emp.id,
        code: emp.employeeCode,
        name: emp.name,
        role: emp.role,
        department: emp.department?.name || "General",
        hourlyWage: wage,
        daysPresent,
        daysLate,
        totalLateMinutes: totalLateMins,
        totalHours,
        regularHours,
        overtimeHours,
        estimatedTotalPay,
        recordsCount: emp.attendances.length,
      };
    });

    return NextResponse.json({
      summary: {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        totalEmployees: employees.length,
        totalGrossEstimatedPay: parseFloat(totalGrossEstimatedPay.toFixed(2)),
        totalWorkHours: parseFloat(totalWorkHoursAll.toFixed(2)),
        totalOvertimeHours: parseFloat(totalOvertimeHoursAll.toFixed(2)),
        totalLateIncidents: totalLateIncidentsAll,
      },
      reports: employeeReports,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
