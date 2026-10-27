import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Employee Attendance System database...");

  // 1. Company Settings
  const settings = await prisma.companySettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      companyName: "Craft & Foundry Studio",
      tagline: "Design, Retail & Custom Fabrication",
      adminPin: "1234",
      timezone: "America/New_York",
      currency: "$",
      kioskResetSeconds: 4,
      allowBreakPunches: true,
      requirePin: true,
      soundEffects: true,
    },
  });
  console.log(`✅ Company settings configured: ${settings.companyName}`);

  // 2. Default Shift Policy
  const defaultShift = await prisma.shiftPolicy.upsert({
    where: { id: "shift-standard" },
    update: {},
    create: {
      id: "shift-standard",
      name: "General Day Shift",
      startTime: "09:00",
      endTime: "17:00",
      graceMinutes: 15,
      halfDayHours: 4.0,
      fullDayHours: 8.0,
      isDefault: true,
    },
  });

  // 3. Departments
  const deptWorkshop = await prisma.department.upsert({
    where: { name: "Workshop & Fabrication" },
    update: {},
    create: {
      name: "Workshop & Fabrication",
      color: "amber",
    },
  });

  const deptRetail = await prisma.department.upsert({
    where: { name: "Retail & Customer Desk" },
    update: {},
    create: {
      name: "Retail & Customer Desk",
      color: "emerald",
    },
  });

  const deptDesign = await prisma.department.upsert({
    where: { name: "Design & CAD" },
    update: {},
    create: {
      name: "Design & CAD",
      color: "blue",
    },
  });

  const deptLogistics = await prisma.department.upsert({
    where: { name: "Dispatch & Logistics" },
    update: {},
    create: {
      name: "Dispatch & Logistics",
      color: "purple",
    },
  });

  // 4. Employees
  const employeeData = [
    {
      employeeCode: "EMP-101",
      name: "Elena Rostova",
      role: "Lead Fabricator",
      departmentId: deptWorkshop.id,
      pin: "1001",
      hourlyWage: 28.5,
      email: "elena@craftfoundry.local",
      phone: "+1 555-0141",
      avatarColor: "bg-amber-600",
      shiftPolicyId: defaultShift.id,
    },
    {
      employeeCode: "EMP-102",
      name: "Marcus Vance",
      role: "Store Manager",
      departmentId: deptRetail.id,
      pin: "1002",
      hourlyWage: 32.0,
      email: "marcus@craftfoundry.local",
      phone: "+1 555-0142",
      avatarColor: "bg-emerald-600",
      shiftPolicyId: defaultShift.id,
    },
    {
      employeeCode: "EMP-103",
      name: "Sophia Chen",
      role: "Senior Industrial Designer",
      departmentId: deptDesign.id,
      pin: "1003",
      hourlyWage: 35.0,
      email: "sophia@craftfoundry.local",
      phone: "+1 555-0143",
      avatarColor: "bg-blue-600",
      shiftPolicyId: defaultShift.id,
    },
    {
      employeeCode: "EMP-104",
      name: "Tariq Al-Mansoor",
      role: "Inventory & Dispatch Specialist",
      departmentId: deptLogistics.id,
      pin: "1004",
      hourlyWage: 24.0,
      email: "tariq@craftfoundry.local",
      phone: "+1 555-0144",
      avatarColor: "bg-purple-600",
      shiftPolicyId: defaultShift.id,
    },
    {
      employeeCode: "EMP-105",
      name: "Chloe Bennett",
      role: "Customer Experience Associate",
      departmentId: deptRetail.id,
      pin: "1005",
      hourlyWage: 19.5,
      email: "chloe@craftfoundry.local",
      phone: "+1 555-0145",
      avatarColor: "bg-rose-600",
      shiftPolicyId: defaultShift.id,
    },
  ];

  for (const emp of employeeData) {
    await prisma.employee.upsert({
      where: { employeeCode: emp.employeeCode },
      update: {},
      create: emp,
    });
  }

  // 5. Seed some initial today's punches for immediate testing
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const empMarcus = await prisma.employee.findUnique({
    where: { employeeCode: "EMP-102" },
  });

  const empElena = await prisma.employee.findUnique({
    where: { employeeCode: "EMP-101" },
  });

  if (empMarcus) {
    const clockInTime = new Date();
    clockInTime.setHours(8, 55, 0, 0);

    const att = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: empMarcus.id,
          date: today,
        },
      },
      update: {},
      create: {
        employeeId: empMarcus.id,
        date: today,
        status: "PRESENT",
        clockIn: clockInTime,
        isLate: false,
        lateMinutes: 0,
      },
    });

    await prisma.punch.create({
      data: {
        attendanceId: att.id,
        type: "CLOCK_IN",
        timestamp: clockInTime,
        notes: "Morning shift check-in",
      },
    });
  }

  if (empElena) {
    const clockInTime = new Date();
    clockInTime.setHours(9, 22, 0, 0);

    const att = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: empElena.id,
          date: today,
        },
      },
      update: {},
      create: {
        employeeId: empElena.id,
        date: today,
        status: "LATE",
        clockIn: clockInTime,
        isLate: true,
        lateMinutes: 22,
      },
    });

    await prisma.punch.create({
      data: {
        attendanceId: att.id,
        type: "CLOCK_IN",
        timestamp: clockInTime,
        notes: "Late arrival (traffic delay)",
      },
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
