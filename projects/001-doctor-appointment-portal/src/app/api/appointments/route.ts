import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function generateBookingRef(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `DOC-${randomNum}`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const query = searchParams.get('query');
    const status = searchParams.get('status');

    const whereClause: any = {};

    if (date) {
      whereClause.appointmentDate = date;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (query && query.trim() !== '') {
      const q = query.trim();
      whereClause.OR = [
        { bookingRef: { contains: q, mode: 'insensitive' } },
        { patientName: { contains: q, mode: 'insensitive' } },
        { patientPhone: { contains: q, mode: 'insensitive' } },
      ];
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      orderBy: [
        { appointmentDate: 'desc' },
        { appointmentTime: 'asc' },
      ],
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patientName, patientPhone, patientEmail, reason, appointmentDate, appointmentTime } = body;

    if (!patientName || !patientPhone || !reason || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { error: 'Name, phone, reason, date, and time slot are required.' },
        { status: 400 }
      );
    }

    // Check if slot is already occupied
    const existing = await prisma.appointment.findFirst({
      where: {
        appointmentDate,
        appointmentTime,
        status: { not: 'CANCELLED' },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'This time slot was just booked by another patient. Please select an alternate slot.' },
        { status: 409 }
      );
    }

    // Generate unique reference
    let bookingRef = generateBookingRef();
    let collision = await prisma.appointment.findUnique({ where: { bookingRef } });
    while (collision) {
      bookingRef = generateBookingRef();
      collision = await prisma.appointment.findUnique({ where: { bookingRef } });
    }

    const appointment = await prisma.appointment.create({
      data: {
        bookingRef,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        patientEmail: patientEmail?.trim() || null,
        reason: reason.trim(),
        appointmentDate,
        appointmentTime,
        status: 'CONFIRMED',
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json({ error: 'Failed to book appointment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (date) {
      const res = await prisma.appointment.deleteMany({
        where: { appointmentDate: date },
      });
      return NextResponse.json({ success: true, count: res.count, message: `Cleared appointments for ${date}` });
    }

    const res = await prisma.appointment.deleteMany();
    return NextResponse.json({ success: true, count: res.count, message: 'All appointments cleared successfully' });
  } catch (error) {
    console.error('Error clearing appointments:', error);
    return NextResponse.json({ error: 'Failed to clear appointments' }, { status: 500 });
  }
}
