import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      employeeCode,
      role,
      departmentId,
      pin,
      hourlyWage,
      email,
      phone,
      isActive,
      avatarColor,
    } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (employeeCode !== undefined) updateData.employeeCode = employeeCode.trim().toUpperCase();
    if (role !== undefined) updateData.role = role.trim();
    if (departmentId !== undefined) updateData.departmentId = departmentId || null;
    if (pin !== undefined && pin.trim().length >= 4) updateData.pin = pin.trim();
    if (hourlyWage !== undefined) updateData.hourlyWage = parseFloat(hourlyWage);
    if (email !== undefined) updateData.email = email ? email.trim() : null;
    if (phone !== undefined) updateData.phone = phone ? phone.trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (avatarColor !== undefined) updateData.avatarColor = avatarColor;

    const updated = await prisma.employee.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        action: "EMPLOYEE_UPDATED",
        details: `Updated employee ${updated.name} (${updated.employeeCode})`,
      },
    });

    const { pin: _, ...safeEmployee } = updated;
    return NextResponse.json({ success: true, employee: safeEmployee });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.employee.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    // Cascade deletes attendance and punches
    await prisma.employee.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: "EMPLOYEE_DELETED",
        details: `Deleted employee ${existing.name} (${existing.employeeCode})`,
      },
    });

    return NextResponse.json({ success: true, message: "Employee removed successfully" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
